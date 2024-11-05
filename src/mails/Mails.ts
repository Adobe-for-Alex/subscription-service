import Mail from '../mail/Mail'

export default interface Mails {
  mail(address: string, password: string): Promise<Mail>
}
