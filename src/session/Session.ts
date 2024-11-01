import {Account} from '../adobe/Account'
import {Json} from '../aliases'

export interface Session {
  account(): Promise<Account>
  asJson(): Promise<Json>
  delete(): Promise<void>
}