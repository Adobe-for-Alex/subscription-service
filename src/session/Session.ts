import {Json} from '../aliases'
import Account from "../adobe/Account";

export default interface Session {
  account(): Promise<Account>
  delete(): Promise<void>
  asJson(): Promise<Json>
}