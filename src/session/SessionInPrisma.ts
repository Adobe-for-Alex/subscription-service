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

  async updated(): Promise<boolean> {
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

    if (!sessionAccount) return false;

    const { mail } = sessionAccount.account;
    const adobeAccount = await this.adobe.account(mail.email, mail.password);
    const hasSubscription = await adobeAccount.subscribed();

    if (!hasSubscription) {
      await adobeAccount.delete();
      await this.createNewAccount(mail.email, mail.password);
      return true;
    }

    return false;
  }

  async delete(): Promise<void> {
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

    if (sessionAccount) {
      const { mail } = sessionAccount.account;
      const adobeAccount = await this.adobe.account(mail.email, mail.password);
      await adobeAccount.delete();
    }

    await this.prisma.session.delete({
      where: { id: this.id }
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

  private async createNewAccount(email: string, password: string): Promise<void> {
    await this.adobe.account(email, password);
  }
}
