import { AxiosInstance } from "axios"
import Account from "./Account"

export default class AdobeAccount implements Account {
  constructor(
    private readonly api: AxiosInstance,
    private readonly accountId: string
  ) { }

  async subscribed(): Promise<boolean> {
    const userResponse = await this.api.get(`/users/${this.accountId}`)
    const boardId = userResponse.data.board
    if (!boardId) return false
    const boardResponse = await this.api.get(`/boards/${boardId}`)
    return boardResponse.data.subscription
  }

  async delete(): Promise<void> {
    await this.api.delete(`/users/${this.accountId}`)
  }
}
