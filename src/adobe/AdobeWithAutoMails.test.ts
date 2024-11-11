import { FakeMails } from "../mails/Mails"
import { FakeAdobe } from "./Adobe"
import AdobeWithAutoMails from "./AdobeWithAutoMails"

describe('AdobeWithAutoMails', () => {
  it('should get mail for each account', async () => {
    const mails = new FakeMails()
    await new AdobeWithAutoMails(mails, new FakeAdobe()).account('test@mail.com', 'password')
    expect(mails.createdMails).toEqual([{ address: 'test@mail.com', password: 'password' }])
  })
  
  it('should delete mail on delete account', async () => {
    const mails = new FakeMails()
    await new AdobeWithAutoMails(mails, new FakeAdobe()).account('x', 'y').then(x => x.delete())
    expect(mails.deletedMails).toEqual([{ address: 'x', password: 'y' }])
  })
})
