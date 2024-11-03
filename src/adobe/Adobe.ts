import Account from '../account/Account'
import Mail from '../mail/Mail'

export default interface Adobe {
  account(mail: Mail): Promise<Account>
}
