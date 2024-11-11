import Account from '../account/Account'

export default interface Adobe {
  account(address: string, password: string): Promise<Account>
}

export namespace FakeAdobe {
  export type Account = {
    address: string,
    password: string
  }
}

export class FakeAdobe implements Adobe {
  public readonly createdAccounts: FakeAdobe.Account[] = []
  public readonly deletedAccounts: FakeAdobe.Account[] = []
  constructor(
    private readonly hasSubscription: boolean = false,
    private readonly existsAccounts: FakeAdobe.Account[] = []
  ) { }
  async account(address: string, password: string): Promise<Account> {
    const adapt = (x: FakeAdobe.Account): Account => ({
      subscribed: async () => this.hasSubscription,
      delete: async () => {
        this.deletedAccounts.push(x)
        this.existsAccounts.splice(this.existsAccounts.indexOf(x), 1)
      }
    })
    const existsAccount = this.existsAccounts.find(x => x.address === address)
    if (existsAccount) return adapt(existsAccount)
    const newAccount: FakeAdobe.Account = { address, password }
    this.createdAccounts.push(newAccount)
    this.existsAccounts.push(newAccount)
    return adapt(newAccount)
  }
}
