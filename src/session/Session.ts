import {Account} from '../adobe/Account'
import {Json} from '../aliases'

export interface Session {
  account(): Promise<Account>
  delete(): Promise<void>
  asJson(): Promise<Json>
}