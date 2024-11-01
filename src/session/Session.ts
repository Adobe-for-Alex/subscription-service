import {Json} from '../aliases'
import {Account} from "../adobe/Account";

export interface Session {
  account(): Promise<Account>
  delete(): Promise<void>
  asJson(): Promise<Json>
}