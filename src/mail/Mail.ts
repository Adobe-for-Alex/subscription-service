export default interface Mail {
  address(): Promise<string>
  password(): Promise<string>
  delete(): Promise<void>
}

export class RealMail implements Mail {
  private emailAddress: string;
  private pwd: string;

  constructor(emailAddress: string, pwd: string) {
    this.emailAddress = emailAddress;
    this.pwd = pwd;
  }

  async address(): Promise<string> {
    return this.emailAddress;
  }

  async password(): Promise<string> {
    return this.pwd;
  }

  async delete(): Promise<void> {
    
  }
}
