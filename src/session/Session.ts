import Account from '../account/Account'
import { Json } from '../aliases'

export default interface Session {
  account(): Promise<Account>
  delete(): Promise<void>
  asJson(): Promise<Json>
}
