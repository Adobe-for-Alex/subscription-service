import Mail from '../mail/Mail'

export default interface MailServer {
  create(): Promise<Mail>
}
