import { PrismaClient } from '@prisma/client'
import Sessions from './Sessions'
import Adobe from '../adobe/Adobe'
import Session from '../session/Session'
import { SessionId } from '../aliases'
import SessionInPrisma from '../session/SessionInPrisma'
import Mails from '../mails/Mails'

export default class SessionsInPrisma implements Sessions {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly adobe: Adobe,
    private readonly mails: Mails
  ) { }

  async all(): Promise<Session[]> {
    const sessions = await this.prisma.session.findMany({
      where: {
        endedAt: null
      }
    });

    type SessionType = Awaited<ReturnType<typeof this.prisma.session.findMany>>[number];

    return sessions.map((session: SessionType) => 
      new SessionInPrisma(this.prisma, session.id, this.adobe)
    );
  }

  async session(): Promise<Session> {
    const email = `user${Date.now()}@tempmail.com`;
    const password = Math.random().toString(36).slice(-8);

    const session = await this.prisma.session.create({
      data: {
        id: `adobe-${Date.now()}`,
        createdAt: new Date()
      }
    });

    await this.mails.mail(email, password);

    const mail = await this.prisma.mail.findFirst({
      where: { email }
    });

    if (!mail) throw new Error('Mail not found');

    const account = await this.prisma.account.create({
      data: {
        id: `account-${Date.now()}`,
        mailId: mail.id,
        password
      }
    });

    await this.prisma.sessionAccount.create({
      data: {
        sessionId: session.id,
        accountId: account.id
      }
    });

    await this.adobe.account(email, password);

    return new SessionInPrisma(this.prisma, session.id, this.adobe);
  }

  async withId(id: SessionId): Promise<Session | undefined> {
    const session = await this.prisma.session.findUnique({
      where: { id }
    });

    if (!session) return undefined;

    return new SessionInPrisma(this.prisma, id, this.adobe);
  }
}
