import nock from 'nock'
import AdobeApi from './AdobeApi'
import createPrismaMock from 'prisma-mock'
import { PrismaClient } from '@prisma/client'

describe('AdobeApi', () => {
  afterEach(() => nock.cleanAll())

  it('should send HTTP POST request to create account if prisma do not contain account', async () => {
    const createdUsers: any[] = []
    nock('http://adobe-api')
      .post('/users')
      .reply(201, (_, data) => { 
        createdUsers.push(data)
        return '"abobus"' 
      })
      .get('/boards')
      .reply(200, [])

    const prisma = createPrismaMock<PrismaClient>({
      mail: [{
        id: 'mail-1',
        email: 'test@mail.com',
        password: '123',
        token: 'test-token',
        createdAt: new Date()
      }]
    })

    await new AdobeApi(new URL('http://adobe-api'), prisma)
      .account('test@mail.com', '123')

    expect(createdUsers).toEqual([{
      email: 'test@mail.com',
      password: '123'
    }])
  })

  it('should attach account to existing board after create', async () => {
    let abobusData: any = {}
    
    nock('http://adobe-api')
      .post('/users')
      .reply(201, '"abobus"')
      .get('/boards')
      .reply(200, ['board-1'])
      .put('/users/abobus')
      .reply(200, (_, data) => { 
        abobusData = data
        return data 
      })

    const prisma = createPrismaMock<PrismaClient>({
      mail: [{
        id: 'mail-1',
        email: 'test@mail.com',
        password: '123',
        token: 'test-token',
        createdAt: new Date()
      }]
    })

    await new AdobeApi(new URL('http://adobe-api'), prisma)
      .account('test@mail.com', '123')

    expect(abobusData).toEqual({
      board: 'board-1'
    })
  })

  it.each([false, true])('should send HTTP GET request to check account subscription: %s', async (hasSubscription) => {
    const prisma = createPrismaMock<PrismaClient>({
      mail: [{
        id: 'mail-2',
        email: 'test@mail.com',
        password: '123',
        token: 'token',
        createdAt: new Date()
      }],
      account: [{
        id: 'account-2', 
        mailId: 'mail-2',
        password: '123',
        createdAt: new Date()
      }]
    })

    nock('http://adobe-api')
      .get('/users/account-2')
      .reply(200, {
        id: 'account-2',
        email: 'test@mail.com',
        board: 'board-1'
      })
      .get('/boards/board-1')
      .reply(200, {
        id: 'board-1',
        subscription: hasSubscription
      })

    const account = await new AdobeApi(
      new URL('http://adobe-api'),
      prisma
    ).account('test@mail.com', '123')

    expect(await account.subscribed()).toBe(hasSubscription)
  })

  it('should send HTTP DELETE request to delete account', async () => {
    const prisma = createPrismaMock<PrismaClient>({
      mail: [{
        id: 'mail-3',
        email: 'test@mail.com', 
        password: '123',
        token: 'token',
        createdAt: new Date()
      }],
      account: [{
        id: 'abobasun',
        mailId: 'mail-3',
        password: '123',
        createdAt: new Date() 
      }]
    })

    nock('http://adobe-api')
      .delete('/users/abobasun')
      .reply(200)

    const account = await new AdobeApi(
      new URL('http://adobe-api'),
      prisma
    ).account('test@mail.com', '123')

    await account.delete()

    expect(nock.isDone()).toBe(true)
  })
})