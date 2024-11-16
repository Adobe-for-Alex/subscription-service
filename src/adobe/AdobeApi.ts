import { PrismaClient } from '@prisma/client'
import Adobe from './Adobe'
import Account from '../account/Account'
import axios from 'axios'

interface MailTmAccount {
  id: string
  address: string
}

interface MailTmToken {
  token: string
}

export default class AdobeApi implements Adobe {
  private readonly mailTmApi = axios.create({ baseURL: 'https://api.mail.tm' })

  constructor(
    private readonly baseUrl: URL,
    private readonly prisma: PrismaClient
  ) { }

  async account(address: string, password: string): Promise<Account> {
    const existingMail = await this.prisma.mail.findFirst({
      where: { email: address },
      include: { account: true }
    })

    if (existingMail?.account) {
      return this.createAccountAdapter(existingMail.account.id)
    }

    const response = await fetch(`${this.baseUrl}/users`, {
      method: 'POST',
      body: JSON.stringify({ email: address, password }),
      headers: { 'Content-Type': 'application/json' }
    })
    const userId = JSON.parse(await response.text())

    const boardsResponse = await fetch(`${this.baseUrl}/boards`)
    const boards = await boardsResponse.json()

    if (boards.length > 0) {
      await fetch(`${this.baseUrl}/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({ board: boards[0] }),
        headers: { 'Content-Type': 'application/json' }
      })
    }

    await this.prisma.mail.create({
      data: {
        id: await this.mailTmApi.post<MailTmAccount>('/accounts', { address, password })
          .then(x => x.data.id),
        email: address,
        password: password,
        token: await this.mailTmApi.post<MailTmToken>('/token', { address, password })
          .then(x => x.data.token),
        account: {
          create: {
            id: userId,
            password
          }
        }
      }
    })

    return this.createAccountAdapter(userId)
  }

  private createAccountAdapter(userId: string): Account {
    return {
      subscribed: async () => {
        const userResponse = await fetch(`${this.baseUrl}/users/${userId}`)
        const userData = await userResponse.json()
        
        const boardResponse = await fetch(`${this.baseUrl}/boards/${userData.board}`)
        const boardData = await boardResponse.json()
        
        return boardData.subscription
      },
      delete: async () => {
        await fetch(`${this.baseUrl}/users/${userId}`, { method: 'DELETE' })
      }
    }
  }
}