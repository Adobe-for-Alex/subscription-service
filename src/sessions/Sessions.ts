import { SessionId } from '../aliases'
import Session from '../session/Session'

export default interface Sessions {
  create(): Promise<Session>
  withId(id: SessionId): Promise<Session | undefined>
}
