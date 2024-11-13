
import { AxiosInstance } from 'axios'
import Mail from './Mail'

export default class TmMail implements Mail {
  constructor(private readonly id: string, private readonly token: string, private readonly api: AxiosInstance) {}

  async delete(): Promise<void> {
    await this.api.delete(`/accounts/${this.id}`, {
      headers: { 
        Authorization: `Bearer ${this.token}` 
      }
    })
  }
}