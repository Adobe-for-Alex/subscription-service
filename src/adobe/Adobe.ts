import {Mail} from '../mail/Mail'
import {Account} from './Account'

export interface Adobe {
  account(mail: Mail): Promise<Account>
}