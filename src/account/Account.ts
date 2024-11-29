export default interface Account {
  email(): Promise<string>
  delete(): Promise<void>
}
