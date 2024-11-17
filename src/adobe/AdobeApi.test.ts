import axios from 'axios';
import nock from 'nock'
import AdobeApi from './AdobeApi'
import createPrismaMock from 'prisma-mock'
import { PrismaClient } from '@prisma/client'

describe('AdobeApi', () => {
  afterEach(() => nock.cleanAll())
  it('should send HTTP POST request to create account if prisma do not contain account', async () => {
    const createdUsers: any[] = []
    nock('http://adobe-api')
      .post('/users').reply(201, (_, data) => { 
        createdUsers.push(data); 
        return '"abobus"' 
      })
      .get('/boards').reply(200, [])
    
    await new AdobeApi(
      axios.create({ baseURL: 'http://adobe-api' }), 
      createPrismaMock({
        mail: [{
          id: 'mail-1',
          email: 'test@mail.com',
          password: '123', 
          token: 'token',
          createdAt: new Date()
        }]
      })
    ).account('test@mail.com', '123')
    
    expect(createdUsers).toEqual([{ email: 'test@mail.com', password: '123' }])
  })
  it('should attach account to existing board after create', async () => {
    let abobusData: any = {}
    nock('http://adobe-api')
      .post('/users').reply(201, '"abobus"')
      .get('/boards').reply(200, ['board-1'])
      .put('/users/abobus').reply(200, (_, data) => { abobusData = data })
  
    await new AdobeApi(
      axios.create({ baseURL: 'http://adobe-api' }), 
      createPrismaMock({
        mail: [{
          id: 'mail-1',
          email: 'test@mail.com', 
          password: '123',
          token: 'token',
          createdAt: new Date()
        }]
      })
    ).account('test@mail.com', '123')
  
    expect(abobusData).toEqual({ board: 'board-1' })
  })
  it('should return account from prisma', async () => {
    nock('http://adobe-api') // to throw exception for all requests
    await expect(new AdobeApi(axios.create({ baseURL: 'http://adobe-api' }), createPrismaMock<PrismaClient>({
      mail: [
        {
          id: 'mail-1',
          email: 'test@mail.com',
          password: '123',
          createdAt: new Date()
        }
      ],
      account: [
        {
          id: 'account-1',
          mailId: 'mail-1',
          password: '123',
          createdAt: new Date()
        }
      ]
    })).account('test@mail.com', '123')).resolves.not.toThrow()
  })
  it.each([false, true])('should send HTTP GET request to check account subscription: %s', async x => {
    nock('http://adobe-api')
      .get('/users/abobasun').reply(200, {
        id: 'abobasun',
        email: 'test123@mail.com',
        password: '123',
        board: 'board-1'
      })
      .get('/boards/board-1').reply(200, {
        id: 'board-1',
        subscription: x,
        user_limit: 5,
        users: ['abobasun']
      });

    const api = new AdobeApi(
      axios.create({ baseURL: 'http://adobe-api' }), 
      createPrismaMock({
        mail: [{
          id: 'mail-2',
          email: 'test123@mail.com',
          password: '123',
          createdAt: new Date()
        }],
        account: [{
          id: 'abobasun', 
          mailId: 'mail-2',
          password: '123',
          createdAt: new Date()
        }]
      })
    );

    const account = await api.account('test123@mail.com', '123');
    expect(await account.subscribed()).toBe(x);
})
  it('should send HTTP DELETE request to delete account', async () => {
    const deletedUsers: string[] = []
    nock('http://adobe-api').delete(/\/users\/\S+/).reply(200, x => { deletedUsers.push(x) })
    await new AdobeApi(axios.create({ baseURL: 'http://adobe-api' }), createPrismaMock({
      mail: [
        {
          id: 'mail-3',
          email: 'test123@mail.com',
          password: '123',
          createdAt: new Date()
        }
      ],
      account: [
        {
          id: 'abobasun',
          mailId: 'mail-3',
          password: '123',
          createdAt: new Date()
        }
      ]
    })).account('test123@mail.com', '123').then(x => x.delete())
    expect(deletedUsers).toContainEqual('/users/abobasun')
  })
})