import { PrismaClient } from '@prisma/client'
import Adobe from './Adobe'
import Account from '../account/Account'
import { AxiosInstance } from 'axios'

export default class AdobeApi implements Adobe {
  constructor(
    private readonly api: AxiosInstance,
    private readonly prisma: PrismaClient
  ) { }

  async account(address: string, password: string): Promise<Account> {
    const existingAccount = await this.prisma.account.findFirst({
      where: { mail: { email: address } }
    })
    
    if (existingAccount) {
      return this.createAccountAdapter(existingAccount.id)
    }
  
    const { data: userId } = await this.api.post('/users', { 
      email: address, 
      password 
    })
  
    const { data: boards } = await this.api.get('/boards')
    if (boards.length > 0) {
      await this.api.put(`/users/${userId}`, {
        board: boards[0]
      })
    }
  
    const mail = await this.prisma.mail.findFirst({
      where: { email: address }
    })
  
    if (!mail) {
      throw new Error(`Mail record not found for ${address}`)
    }
  
    await this.prisma.account.create({
      data: {
        id: userId,
        password,
        mailId: mail.id 
      }
    })
  
    return this.createAccountAdapter(userId)
  }

  private createAccountAdapter(userId: string): Account {
    return {
      subscribed: async () => {
        const { data: userData } = await this.api.get(`/users/${userId}`)
        const { data: boardData } = await this.api.get(`/boards/${userData.board}`)
        return boardData.subscription
      },
      delete: async () => {
        await this.api.delete(`/users/${userId}`)
      }
    }
  }
}