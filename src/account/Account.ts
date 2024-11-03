import Mail from '../mail/Mail'

export default interface Account {
  mail(): Promise<Mail>
  subscribed(): Promise<boolean>
}