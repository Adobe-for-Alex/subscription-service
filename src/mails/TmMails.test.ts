import { TmMails } from './TmMails';

describe('TmMails Integration Tests', () => {
  it('should create mail with tm domain', async () => {
    expect(await (await new TmMails().create()).address()).toMatch(/test\d+@tm.com/);
  });

  it('should create unique mails', async () => {
    const mails = new TmMails();
    expect(await (await mails.create()).address()).not.toBe(await (await mails.create()).address());
  });

  it('should delete created mail', async () => {
    await expect((await new TmMails().create()).delete()).resolves.not.toThrow();
  });
});