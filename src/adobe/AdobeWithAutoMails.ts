import Account from '../account/Account'
import Mails from '../mails/Mails'
import { override } from '../utils'
import Adobe from './Adobe'

export default class AdobeWithAutoMails implements Adobe {
  constructor(
    private readonly mails: Mails,
    private readonly origin: Adobe
  ) { }
  async expiredAccounts(): Promise<Account[]> {
    throw new Error('Method not implemented.')
  }
  async account(address: string, password: string): Promise<Account> {
    const mail = await this.mails.mail(address, password)
    const account = await this.origin.account(address, password)
    return override(account, {
      delete: async () => {
        await account.delete()
        await mail.delete()
      }
    })
  }
}
