import { PrismaClient } from '@prisma/client';
import { SessionsInPrisma } from './SessionsInPrisma';
import { RealMails } from '../mails/Mails';
import AdobeWithAutoMails from '../adobe/AdobeWithAutoMails';
import { SessionId } from '../aliases';

describe('SessionsInPrisma Integration Tests', () => {
  it('should create session from account', async () => {
    expect((await (await new SessionsInPrisma(new PrismaClient()).session(await new AdobeWithAutoMails(new RealMails()).account(await new RealMails().create()))).asJson())['email']).toMatch(/@/);
    expect((await (await new SessionsInPrisma(new PrismaClient()).session(await new AdobeWithAutoMails(new RealMails()).account(await new RealMails().create()))).asJson())['id']).toBeTruthy();
  });

  it('should find session by id', async () => {
    expect(await new SessionsInPrisma(new PrismaClient()).withId((await (await new SessionsInPrisma(new PrismaClient()).session(await new AdobeWithAutoMails(new RealMails()).account(await new RealMails().create()))).asJson())['id'] as SessionId)).toBeTruthy();
  });

  it('should delete session', async () => {
    const prisma = new PrismaClient();
    const session = await new SessionsInPrisma(prisma).session(await new AdobeWithAutoMails(new RealMails()).account(await new RealMails().create()));
    await session.delete();
    expect(await new SessionsInPrisma(prisma).withId((await session.asJson())['id'] as SessionId)).toBeUndefined();
  });
});