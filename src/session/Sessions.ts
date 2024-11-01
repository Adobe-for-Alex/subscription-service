import { Session } from './Session'
import { SessionId } from '../aliases'

export interface Sessions {
  create(): Promise<Session>
  withId(id: SessionId): Promise<Session | undefined>
}