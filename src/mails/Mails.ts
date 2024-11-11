import Mail from '../mail/Mail'

export default interface Mails {
  mail(address: string, password: string): Promise<Mail>
}

export namespace FakeMails {
  export type Mail = {
    address: string,
    password: string
  }
}

export class FakeMails implements Mails {
  public readonly createdMails: FakeMails.Mail[] = []
  public readonly deletedMails: FakeMails.Mail[] = []
  constructor(
    private readonly existsMails: FakeMails.Mail[] = []
  ) { }
  async mail(address: string, password: string): Promise<Mail> {
    const adapt = (x: FakeMails.Mail): Mail => ({
      delete: async () => {
        this.deletedMails.push(x)
        this.existsMails.splice(this.existsMails.indexOf(x), 1)
      }
    })
    const existsAccount = this.existsMails.find(x => x.address === address)
    if (existsAccount) return adapt(existsAccount)
    const newAccount: FakeMails.Mail = { address, password }
    this.createdMails.push(newAccount)
    this.existsMails.push(newAccount)
    return adapt(newAccount)
  }
}
