import { PrismaClient } from '@prisma/client'
import createPrismaMock from 'prisma-mock'
import SessionsInPrisma from './SessionsInPrisma'
import Adobe from '../adobe/Adobe'

const fakeAdobe = (): Adobe => ({
  account: async () => ({
    subscribed: async () => false,
    delete: async () => { }
  })
})

describe('SessionsInPrisma', () => {
  it.each([1, 2, 3, 4])('should return %s sessions from prisma', async count => {
    const prisma = createPrismaMock<PrismaClient>({
      session: new Array(count).fill(undefined).map((_, i) => ({
        id: `adobe-${i}`,
        createdAt: new Date()
      }))
    })
    expect(await new SessionsInPrisma(prisma, fakeAdobe()).all().then(x => x.length)).toBe(count)
  })
  it('should not return session that ended', async () => {
    const prisma = createPrismaMock<PrismaClient>({
      session: [{
        id: 'adobe-1',
        endedAt: new Date(),
        createdAt: new Date()
      }]
    })
    expect(await new SessionsInPrisma(prisma, fakeAdobe()).all().then(x => x.length)).toBe(0)
  })
  it('should create new session', async () => {
    const prisma = createPrismaMock<PrismaClient>()
    await new SessionsInPrisma(prisma, fakeAdobe()).session()
    expect(prisma.session.count()).toBeGreaterThanOrEqual(1)
  })
  it('should create new account on create new session', async () => {
    const createdAccounts: any[] = []
    const adobe: Adobe = {
      account: async (address, password) => {
        createdAccounts.push({ address, password })
        return {
          subscribed: async () => false,
          delete: async () => { }
        }
      }
    }
    await new SessionsInPrisma(createPrismaMock(), adobe).session()
    expect(createdAccounts.length).toBeGreaterThanOrEqual(1)
  })
  it('should return undefined if session with id does not exists', async () => {
    expect(await new SessionsInPrisma(createPrismaMock(), fakeAdobe()).withId('not-exists')).toBe(undefined)
  })
  it('should return session if session with id does exists', async () => {
    const prisma = createPrismaMock<PrismaClient>({
      session: [
        {
          id: 'exists',
          createdAt: new Date()
        }
      ]
    })
    expect(await new SessionsInPrisma(prisma, fakeAdobe()).withId('exists')).not.toBe(undefined)
  })
})
