import AdobeApi from './AdobeApi';
import { RealMails } from '../mails/Mails';

describe('AdobeApi Integration Tests', () => {
  it('should create account with mail', async () => {
    expect(await (await (await new AdobeApi('https://api.adobe.com').account(await new RealMails().create())).mail()).address()).toMatch(/test\d+@example.com/);
  });

  it('should create account with existing mail', async () => {
    expect(await (await (await new AdobeApi('https://api.adobe.com').account(await new RealMails().create())).mail()).address()).toBe(await (await new RealMails().create()).address());
  });

  it('should delete account and associated mail', async () => {
    await expect((await new AdobeApi('https://api.adobe.com').account(await new RealMails().create())).delete()).resolves.not.toThrow();
  });
});