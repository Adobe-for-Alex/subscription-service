import Mail from './Mail'

export default interface MailServer {
  create(): Promise<Mail>
}