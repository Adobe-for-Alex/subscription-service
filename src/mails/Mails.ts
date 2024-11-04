import Mail from '../mail/Mail'

export default interface Mails {
  create(): Promise<Mail>
}
