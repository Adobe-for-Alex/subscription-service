import { PrismaClient } from '@prisma/client'
import Adobe from './Adobe'
import Account from '../account/Account'
import axios, { AxiosInstance } from 'axios'

interface MailTmAccount {
  id: string
  address: string
}

interface MailTmToken {
  token: string
}

export default class AdobeApi implements Adobe {
  private readonly mailTmApi: AxiosInstance
  private readonly adobeApi: AxiosInstance

  constructor(
    baseUrl: URL,
    private readonly prisma: PrismaClient
  ) {
    this.mailTmApi = axios.create({ baseURL: 'https://api.mail.tm' })
    this.adobeApi = axios.create({ baseURL: baseUrl.toString() })
  }

  async account(address: string, password: string): Promise<Account> {
    const existingMail = await this.prisma.mail.findFirst({
      where: { email: address },
      include: { account: true }
    })
    
    if (existingMail?.account) {
      return this.createAccountAdapter(existingMail.account.id)
    }

    const { data: userId } = await this.adobeApi.post('/users', { 
      email: address, 
      password 
    })

    const { data: boards } = await this.adobeApi.get('/boards')
    if (boards.length > 0) {
      await this.adobeApi.put(`/users/${userId}`, {
        board: boards[0]
      })
    }

    await this.prisma.mail.create({
      data: {
        id: await this.mailTmApi.post<MailTmAccount>('/accounts', { address, password })
          .then(x => x.data.id),
        email: address,
        password,
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
        const { data: userData } = await this.adobeApi.get(`/users/${userId}`)
        const { data: boardData } = await this.adobeApi.get(`/boards/${userData.board}`)
        return boardData.subscription
      },
      delete: async () => {
        await this.adobeApi.delete(`/users/${userId}`)
      }
    }
  }
}