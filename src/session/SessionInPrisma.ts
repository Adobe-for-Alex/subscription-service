import { PrismaClient } from '@prisma/client'
import { Json, SessionId } from '../aliases'
import Session from './Session'
import Adobe from '../adobe/Adobe'

export default class SessionInPrisma implements Session {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly id: SessionId,
    private readonly adobe: Adobe
  ) { }

  async delete(): Promise<void> {
    const sessionAccount = await this.prisma.sessionAccount.findFirst({
      where: { sessionId: this.id },
      include: {
        account: {
          include: {
            mail: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (sessionAccount) {
      const { mail } = sessionAccount.account;
      const adobeAccount = await this.adobe.account(mail.email, mail.password);
      await adobeAccount.delete();
    }

    await this.prisma.session.update({
      where: { id: this.id },
      data: { endedAt: new Date() }
    });
  }

  async asJson(): Promise<Json> {
    const sessionAccount = await this.prisma.sessionAccount.findFirst({
      where: { sessionId: this.id },
      include: {
        account: {
          include: {
            mail: true
          }
        }
      }
    });

    if (!sessionAccount) throw new Error("Session not found");

    const { mail } = sessionAccount.account;
    return {
      id: this.id,
      email: mail.email,
      password: mail.password
    };
  }
}
