import Account from '../account/Account'
import { SessionId } from '../aliases'
import Session from '../session/Session'

export default interface Sessions {
  session(account: Account): Promise<Session>
  withId(id: SessionId): Promise<Session | undefined>
}
