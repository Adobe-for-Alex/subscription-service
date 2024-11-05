import Mail from '../mail/Mail';
import Mails from './Mails';
import { RealMail } from '../mail/Mail';

export class TmMails implements Mails {
  private counter = 0;
  
  async create(): Promise<Mail> {
    this.counter++;
    return new RealMail(
      `test${this.counter}@tm.com`,
      `pass${this.counter}`
    );
  }
}