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
  private readonly api = axios.create({
    baseURL: 'https://api.mail.tm'
  })

  private readonly prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async mail(address: string, password: string): Promise<Mail> {
    try {
      const existingMail = await this.prisma.mail.findFirst({
        where: { email: address, password }
      })
      if (existingMail) {
        return this.createMailInterface(address, password)
      }

      const { data: account } = await this.api.post<MailTmAccount>('/accounts', { 
        address, 
        password 
      })
      
      const { data: auth } = await this.api.post<MailTmToken>('/token', { 
        address, 
        password 
      })

      await this.prisma.mail.create({
        data: {
          id: account.id, 
          email: address,
          password,
          createdAt: new Date(),
          token: auth.token
        }
      })

      return {
        delete: async () => {
          await this.api.delete(`/accounts/${account.id}`, {
            headers: { 
              Authorization: `Bearer ${auth.token}` 
            }
          })
        }
      }
    } catch (error) {
      const existingMail = await this.prisma.mail.findFirst({
        where: { email: address, password }
      })
      if (existingMail) {
        return this.createMailInterface(address, password)
      }
      throw error
    }
  }

  private async createMailInterface(address: string, password: string): Promise<Mail> {
    const { data: auth } = await this.api.post<MailTmToken>('/token', { 
      address, 
      password 
    })
    
    const existingMail = await this.prisma.mail.findFirst({
      where: { email: address }
    })

    return {
      delete: async () => {
        await this.api.delete(`/accounts/${existingMail?.id}`, {
          headers: { 
            Authorization: `Bearer ${auth.token}` 
          }
        })
      }
    }
  }
}
