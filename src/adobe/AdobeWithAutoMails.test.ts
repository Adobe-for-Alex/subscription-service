import { FakeMails } from "../mails/Mails"
import { FakeAdobe } from "./Adobe"
import AdobeWithAutoMails from "./AdobeWithAutoMails"

describe('AdobeWithAutoMails', () => {
  it('should get mail for each account', async () => {
    const mails = new FakeMails()
    await new AdobeWithAutoMails(mails, new FakeAdobe()).account('test@mail.com', 'password')
    expect(mails.createdMails).toContainEqual({ address: 'test@mail.com', password: 'password' })
  })

  it('should delete mail on delete account', async () => {
    const mails = new FakeMails()
    await new AdobeWithAutoMails(mails, new FakeAdobe()).account('x', 'y').then(x => x.delete())
    expect(mails.deletedMails).toContainEqual({ address: 'x', password: 'y' })
  })

  it.each([false, true])('should return subscription of origin: %s', async hasSubscription => {
    expect(await new AdobeWithAutoMails(
      new FakeMails(),
      new FakeAdobe(hasSubscription)
    ).account('x', 'y').then(x => x.subscribed())).toBe(hasSubscription)
  })
})
