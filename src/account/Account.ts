export default interface Account {
  subscribed(): Promise<boolean>
  delete(): Promise<void>
}
