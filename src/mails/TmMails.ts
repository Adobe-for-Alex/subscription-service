import { PrismaClient } from '@prisma/client'
import Mails from './Mails'
import Mail from '../mail/Mail'
import axios from 'axios'

interface MailTmAccount {
  id: string
  address: string
}

interface MailTmToken {
  token: string
}

export default class TmMails implements Mails {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly api = axios.create({ baseURL: 'https://api.mail.tm' })
  ) {}

  async mail(address: string, password: string): Promise<Mail> {
    try {
      const existingMail = await this.prisma.mail.findFirst({
        where: { email: address, password }
      })
      if (existingMail) {
        return new TmMail(existingMail.id, existingMail.token, this.api)
      }

      const { data: account } = await this.api.post<MailTmAccount>('/accounts', { 
        address, 
        password 
      })
      
      const token = await this.getToken(address, password)

      await this.prisma.mail.create({
        data: {
          id: account.id, 
          email: address,
          password: password,
          createdAt: new Date(),
          token: token
        }
      })

      return new TmMail(account.id, token, this.api)
    } catch (error) {
      const existingMail = await this.prisma.mail.findFirst({
        where: { email: address, password }
      })
      if (existingMail) {
        return new TmMail(existingMail.id, existingMail.token, this.api) 
      }
      throw error
    }
  }

  private async getToken(address: string, password: string): Promise<string> {
    const { data: auth } = await this.api.post<MailTmToken>('/token', { 
      address, 
      password 
    })
    return auth.token
  }
}

class TmMail implements Mail {
  constructor(private readonly id: string, private readonly token: string, private readonly api: any) {}

  async delete(): Promise<void> {
    await this.api.delete(`/accounts/${this.id}`, {
      headers: { 
        Authorization: `Bearer ${this.token}` 
      }
    })
  }
}
