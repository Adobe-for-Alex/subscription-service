import { AxiosInstance } from "axios"
import Account from "./Account"

export default class AdobeAccount implements Account {
  constructor(
    private readonly api: AxiosInstance,
    private readonly accountEmail: string
  ) { }
  async email(): Promise<string> {
    return this.accountEmail
  }

  async delete(): Promise<void> {
    await this.api.delete(`/users/${this.accountEmail}`)
  }
}
