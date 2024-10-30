import { Mail } from './Mail'

export interface MailServer {
    create(): Promise<Mail>
}