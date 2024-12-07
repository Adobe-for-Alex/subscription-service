import Account from '../account/Account'
import { Json } from '../aliases'

export default interface Session {
  update(account: Account): Promise<void>
  delete(): Promise<void>
  asJson(): Promise<Json>
}
