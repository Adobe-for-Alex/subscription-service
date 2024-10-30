import { Session } from './Session'
import { SessionId } from '../aliases/Aliases'
import { Mail } from '../mail/Mail'

export interface Sessions {
    all(): Promise<Session[]>
    create(mail: Mail): Promise<Session>
    withId(id: SessionId): Promise<Session | undefined>
    delete(id: SessionId): Promise<void>
}