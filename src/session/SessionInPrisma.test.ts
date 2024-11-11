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
  it.each([false, true])('should be updated if account has no subscription', async hasSubscription => {
    expect(await new SessionInPrisma(
      prisma,
      'session-1',
      new FakeAdobe(hasSubscription)
    ).updated()).toBe(!hasSubscription)
  })
  it('should create new account if old account has no subscription', async () => {
    const adobe = new FakeAdobe(false, [{
      address: 'test@mail.com',
      password: '123'
    }])
    await new SessionInPrisma(prisma, 'session-1', adobe).updated()
    expect(adobe.createdAccounts.length).toBeGreaterThanOrEqual(1)
  })
  it('should delete old account if old account has no subscription', async () => {
    const adobe = new FakeAdobe(false, [{
      address: 'test@mail.com',
      password: '123'
    }])
    await new SessionInPrisma(prisma, 'session-1', adobe).updated()
    expect(adobe.deletedAccounts.length).toBeGreaterThanOrEqual(1)
  })
  it('should delete account on delete session', async () => {
    const adobe = new FakeAdobe()
    await new SessionInPrisma(prisma, 'session-1', adobe).delete()
    expect(adobe.deletedAccounts.length).toBeGreaterThanOrEqual(1)
  })
  it('should return json with id, email and password', async () => {
    expect(await new SessionInPrisma(prisma, 'session-1', new FakeAdobe()).asJson())
      .toContainEqual({
        id: 'session-1',
        email: 'test@mail.com',
        password: '123'
      })
  })
})
