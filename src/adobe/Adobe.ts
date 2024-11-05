import Account from '../account/Account'

export default interface Adobe {
  account(address: string, password: string): Promise<Account>
}
