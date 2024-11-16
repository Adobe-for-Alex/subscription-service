import nock from 'nock'
import createPrismaMock from 'prisma-mock'
import TmMails from './TmMails'
import { PrismaClient } from '@prisma/client'

const mailTmApiBaseUrl = new URL('https://api.mail.tm')

describe('TmMails', () => {
  afterEach(() => nock.cleanAll())
  it('should send HTTP POST requests to create mail', async () => {
    const createdMails: any[] = []
    const createdTokens: any[] = []
    nock(mailTmApiBaseUrl)
      .post('/accounts').reply(201, (_, data) => {
        createdMails.push(data)
        return {
          '@context': '/contexts/Account',
          '@id': '/accounts/12345',
          '@type': 'Account',
          'id': '12345',
          'address': 'test@mail.com',
          'quota': 40000000,
          'used': 0,
          'isDisabled': false,
          'isDeleted': false,
          'createdAt': '2024-11-10T13:20:12+00:00',
          'updatedAt': '2024-11-10T13:20:12+00:00'
        }
      })
      .post('/token').reply(201, (_, data) => {
        createdTokens.push(data)
        return {
          'token': 'token-12345',
          '@id': '/accounts/12345',
          'id': '12345'
        }
      })
    await new TmMails(createPrismaMock()).mail('test@mail.com', '123')
    expect(createdMails).toEqual([{ address: 'test@mail.com', password: '123' }])
    expect(createdTokens).toEqual([{ address: 'test@mail.com', password: '123' }])
  })
  it('should return account from prisma', async () => {
    nock(mailTmApiBaseUrl) // to throw exception for all requests
    await expect(new TmMails(createPrismaMock<PrismaClient>({
      mail: [
        {
          id: 'mail-1',
          email: 'test@mail.com',
          password: '123',
          createdAt: new Date(),
          token: 'test-token'
        }
      ]
    })).mail('test@mail.com', '123')).resolves.not.toThrow()
  })
  it('should send HTTP DELETE request to delete account', async () => {
    const deleteRequests: { path: string, headers: any }[] = []
    nock(mailTmApiBaseUrl)
      .delete('/accounts/12345')
      .reply(204, function(path) {
        deleteRequests.push({ path, headers: this.req.headers })
      })
    await new TmMails(createPrismaMock({
      mail: [
        {
          id: '12345',
          email: 'test123@mail.com',
          password: '123',
          token: 'stored-token',
          createdAt: new Date()
        }
      ]
    })).mail('test123@mail.com', '123').then(x => x.delete())
    expect(deleteRequests).toContainEqual({
      path: '/accounts/12345',
      headers: expect.objectContaining({ authorization: 'Bearer stored-token' })
    })
  })
})
