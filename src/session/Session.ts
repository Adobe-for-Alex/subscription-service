import { Mail } from '../mail/Mail'
import {Json, SessionId} from '../aliases/Aliases'

export interface Session {
    id(): Promise<SessionId>
    mail(): Promise<Mail>
    update(mail: Mail): Promise<void>
    valid(): Promise<boolean>
    asJson(): Promise<Json>
}