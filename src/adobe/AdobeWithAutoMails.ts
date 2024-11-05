import Adobe from './Adobe';
import Account from '../account/Account';
import Mail from '../mail/Mail';
import Mails from '../mails/Mails';

export default class AdobeWithAutoMails implements Adobe {
  private mails: Mails;

  constructor(mails: Mails) {
    this.mails = mails;
  }

  async account(mail: Mail): Promise<Account> {
    if (!mail) {
      mail = await this.mails.create();
    }
    const account: Account = {
      mail: async () => mail,
      subscribed: async () => false,
      delete: async () => {
        await mail.delete();
      },
    };
    return account;
  }
}