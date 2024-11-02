import Mail from '../mail/Mail'
import Account from './Account'

export default interface Adobe {
  account(mail: Mail): Promise<Account>
}