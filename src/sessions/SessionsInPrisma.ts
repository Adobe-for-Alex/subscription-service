import { PrismaClient } from '@prisma/client';
import Sessions from './Sessions';
import Account from '../account/Account';
import Session from '../session/Session';
import { SessionId } from '../aliases';
import { SessionInPrisma } from '../session/SessionInPrisma';

export class SessionsInPrisma implements Sessions {
  constructor(private prisma: PrismaClient) {}

  async session(account: Account): Promise<Session> {
    const mail = await account.mail();
    const prismaSession = await this.prisma.session.create({
      data: {
        email: await mail.address(),
        mailTmId: await mail.password(),
        adobeId: 'pending'
      }
    });
    return new SessionInPrisma(this.prisma, prismaSession);
  }

  async withId(id: SessionId): Promise<Session | undefined> {
    const prismaSession = await this.prisma.session.findUnique({
      where: { id }
    });
    return prismaSession ? new SessionInPrisma(this.prisma, prismaSession) : undefined;
  }
}