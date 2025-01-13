import { PrismaClient } from '@prisma/client'
import Sessions from './Sessions'
import Adobe from '../adobe/Adobe'
import Session from '../session/Session'
import { SessionId } from '../aliases'
import SessionInPrisma from '../session/SessionInPrisma'
import axios from 'axios'
import { generate } from 'generate-password'
import { adjectives, animals, colors, uniqueNamesGenerator } from 'unique-names-generator'

export default class SessionsInPrisma implements Sessions {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly adobe: Adobe
  ) { }
  async all(): Promise<Session[]> {
    return (await this.prisma.session.findMany({
      select: { id: true },
      where: { endedAt: null }
    })).map(x => new SessionInPrisma(this.prisma, x.id, this.adobe))
  }
  async allUpdated(): Promise<Session[]> {
    const expiredAccounts = await this.adobe.expiredAccounts()
    const expiredSessions = await this.prisma.session.findMany({
      where: {
        accounts: {
          some: { account: { mail: { email: { in: await Promise.all(expiredAccounts.map(x => x.email())) } } } }
        }
      }
    })
    return await Promise.all(expiredSessions.map(async x => {
      const session = new SessionInPrisma(this.prisma, x.id, this.adobe)
      const { email, password } = await this.creditials()
      await session.update(await this.adobe.account(email, password))
      return session
    }))
  }
  async session(): Promise<Session> {
    const { email, password } = await this.creditials()
    await this.adobe.account(email, password)
    const accountInPrisma = await this.prisma.account.findFirstOrThrow({
      select: { id: true },
      where: { mail: { email } }
    })
    const session = await this.prisma.session.create({
      select: { id: true },
      data: {
        accounts: {
          create: {
            account: {
              connect: {
                id: accountInPrisma.id
              }
            }
          }
        }
      }
    })
    return new SessionInPrisma(this.prisma, session.id, this.adobe)
  }
  async withId(id: SessionId): Promise<Session | undefined> {
    if (!await this.prisma.session.findFirst({ where: { id } }))
      return undefined
    return new SessionInPrisma(this.prisma, id, this.adobe)
  }
  private async creditials(): Promise<{ email: string, password: string }> {
    const domains = (await axios.get('https://api.mail.tm/domains')).data
    console.log('Got domains from mail.tm', domains)
    const list = domains['hydra:member']
    if (!list) throw new Error('Domain list is undefined')
    if (list.length === 0) throw new Error('Domain list is empty')
    const domainEntry = list[0]
    console.log('Domain entry', domainEntry)
    const uniqueId = new Date().getTime().toString(16).toLowerCase()
    const name = uniqueNamesGenerator({
      dictionaries: [adjectives, colors, animals],
      style: 'lowerCase',
      separator: '',
    })
    const email = `${uniqueId}${name}@${domainEntry.domain}`
    const password = generate({
      length: 8,
      strict: true,
      numbers: true,
      lowercase: true,
      uppercase: true,
    })
    return { email, password }
  }
}
