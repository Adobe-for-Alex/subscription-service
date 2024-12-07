import axios, { AxiosInstance } from "axios"
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
    try {
      await this.api.delete(`/users/${this.accountEmail}`)
    } catch (e) {
      if (!axios.isAxiosError(e)) throw e
      if (e.status === axios.HttpStatusCode.NotFound) {
        // ignore
        return
      }
      console.error(e.toString())
      throw new Error(`Failed to delete account ${this.accountEmail}: ${e.response?.status} ${e.response?.statusText} ${JSON.stringify(e.response?.data)}`)
    }
  }
}
