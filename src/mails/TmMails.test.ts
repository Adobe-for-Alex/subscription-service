import nock from 'nock'
import createPrismaMock from 'prisma-mock'
import TmMails from './TmMails'
import { PrismaClient } from '@prisma/client'

const mailTmApiBaseUrl = new URL('https://api.mail.tm')

describe('TmMails', () => {
  afterEach(() => nock.cleanAll())
  it('should send HTTP POST requests to create mail', async () => {
    const createdMails: any[] = []
    const createTokens: any[] = []
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
        createTokens.push(data)
        return {
          'token': 'token-12345',
          '@id': '/accounts/12345',
          'id': '12345'
        }
      })
    await new TmMails(createPrismaMock()).mail('test@mail.com', '123')
    expect(createdMails).toEqual([{ address: 'test@mail.com', password: '123' }])
    expect(createTokens).toEqual([{ address: 'test@mail.com', password: '123' }])
  })
  it('should return account from prisma', async () => {
    nock(mailTmApiBaseUrl) // to throw exception for all requests
    await expect(new TmMails(createPrismaMock<PrismaClient>({
      mail: [
        {
          id: 'mail-1',
          email: 'test@mail.com',
          password: '123',
          createdAt: new Date()
        }
      ]
    })).mail('test@mail.com', '123')).resolves.not.toThrow()
  })
  it('should send HTTP DELETE request to delete account', async () => {
    const deletedUsers: string[] = []
    nock(mailTmApiBaseUrl).delete(/\/accounts\/\S+/).reply(200, x => { deletedUsers.push(x) })
    await new TmMails(createPrismaMock({
      mail: [
        {
          id: 'mail-3',
          email: 'test123@mail.com',
          password: '123',
          createdAt: new Date()
        }
      ]
    })).mail('test@mail.com', '123').then(x => x.delete())
    expect(deletedUsers).toContainEqual(['/accounts/abobasun'])
  })
})
