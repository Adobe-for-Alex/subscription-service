import { SessionId } from '../aliases'
import Session from '../session/Session'

export default interface Sessions {
  all(): Promise<Session[]>
  session(): Promise<Session>
  withId(id: SessionId): Promise<Session | undefined>
}
