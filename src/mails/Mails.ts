import Mail from '../mail/Mail'
import { RealMail } from '../mail/Mail'

export default interface Mails {
  create(): Promise<Mail>
}

export class RealMails implements Mails {
  private counter = 0;

  async create(): Promise<Mail> {
    this.counter++;
    return new RealMail(
      `test${this.counter}@example.com`,
      `pass${this.counter}`
    );
  }
}
