import { Mail } from '../mail/Mail'

export interface Account {
    mail(): Promise<Mail>
}