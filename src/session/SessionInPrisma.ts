import { PrismaClient, Session as PrismaSession } from '@prisma/client';
import Session from './Session';
import { Json } from '../aliases';

export class SessionInPrisma implements Session {
  constructor(
    private prisma: PrismaClient,
    private prismaSession: PrismaSession
  ) {}

  async delete(): Promise<void> {
    await this.prisma.session.delete({
      where: { id: this.prismaSession.id }
    });
  }

  async validate(): Promise<void> {
    if (this.prismaSession.endedAt) {
      throw new Error('Session already ended');
    }
  }

  async asJson(): Promise<Json> {
    return {
      id: this.prismaSession.id,
      email: this.prismaSession.email,
      mailTmId: this.prismaSession.mailTmId,
      adobeId: this.prismaSession.adobeId,
      startedAt: this.prismaSession.startedAt.toISOString(),
      endedAt: this.prismaSession.endedAt?.toISOString()
    };
  }
}