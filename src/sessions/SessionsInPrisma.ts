import { PrismaClient } from '@prisma/client'
import Sessions from './Sessions'
import Adobe from '../adobe/Adobe'
import Session from '../session/Session'
import { SessionId } from '../aliases'
import SessionInPrisma from '../session/SessionInPrisma'
import axios from 'axios'
import { generate } from 'generate-password'

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
    return []
  }
  async session(): Promise<Session> {
    const domains = (await axios.get('https://api.mail.tm/domains')).data
    console.log('Got domains from mail.tm', domains)
    const list = domains['hydra:member']
    if (!list) throw new Error('Domain list is undefined')
    if (list.length === 0) throw new Error('Domain list is empty')
    const domainEntry = list[0]
    console.log('Domain entry', domainEntry)
    const email = `adobus-${+new Date()}@${domainEntry.domain}`
    const password = generate({
      length: 8,
      strict: true,
      numbers: true,
      lowercase: true,
      uppercase: true,
    })
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
}
