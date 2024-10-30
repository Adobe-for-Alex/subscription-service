import { Mail } from '../mail/Mail'
import { Account } from './Account'

export interface Adobe {
    newAccount(mail: Mail): Promise<Account>
}