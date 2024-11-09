import Account from '../account/Account'
import Mails from '../mails/Mails'
import Adobe from './Adobe'

export default class AdobeWithAutoMails implements Adobe {
  constructor(
    private readonly mails: Mails,
    private readonly origin: Adobe
  ) { }
  account(address: string, password: string): Promise<Account> {
    throw new Error("Method not implemented.")
  }
}
