import { PrismaClient } from '@prisma/client'
import SessionInPrisma from "./SessionInPrisma"
import createPrismaMock from 'prisma-mock'
import { FakeAdobe } from '../adobe/Adobe'

describe('SessionInPrisma', () => {
  let prisma = createPrismaMock<PrismaClient>()
  beforeEach(() => prisma = createPrismaMock<PrismaClient>({
    session: [
      {
        id: 'session-1',
        createdAt: new Date()
      }
    ],
    mail: [
      {
        id: 'mail-1',
        token: 'token-1',
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
    ],
    sessionAccount: [
      {
        sessionId: 'session-1',
        accountId: 'account-1',
        createdAt: new Date()
      }
    ]
  }))
  it('should delete account on delete session', async () => {
    const adobe = new FakeAdobe()
    await new SessionInPrisma(prisma, 'session-1', adobe).delete()
    expect(adobe.deletedAccounts.length).toBeGreaterThanOrEqual(1)
  })
  it('should return json with id, email and password', async () => {
    expect(await new SessionInPrisma(prisma, 'session-1', new FakeAdobe()).asJson())
      .toEqual({
        id: 'session-1',
        email: 'test@mail.com',
        password: '123'
      })
  })
})
