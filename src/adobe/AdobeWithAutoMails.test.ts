import AdobeWithAutoMails from './AdobeWithAutoMails';
import { RealMails } from '../mails/Mails'

describe('AdobeWithAutoMails Integration Tests', () => {
  it('should create account with mail', async () => {
    expect(await (await (await new AdobeWithAutoMails(new RealMails()).account(await new RealMails().create())).mail())
    .address()).toMatch(/test\d+@example.com/);
  });

  it('should create account with existing mail', async () => {
    expect(await (await (await new AdobeWithAutoMails(new RealMails()).account(await new RealMails().create())).mail())
    .address()).toBe(await (await new RealMails().create()).address());
  });

  it('should delete account and associated mail', async () => {
    await expect((await new AdobeWithAutoMails(new RealMails()).account(await new RealMails().create())).delete())
    .resolves.not.toThrow();
  });
});