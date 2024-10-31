import { Session } from './Session'
import { SessionId } from '../Aliases'
import { Account } from '../adobe/Account'

export interface Sessions {
  withAccount(account: Account): Promise<Session>  // Replaced create method
  withId(id: SessionId): Promise<Session | undefined>
}