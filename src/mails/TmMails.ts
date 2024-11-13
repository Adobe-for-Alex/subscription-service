import { PrismaClient } from '@prisma/client'
import Mails from './Mails'
import Mail from '../mail/Mail'
import TmMail from '../mail/TmMail'
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
    
    const { data: auth } = await this.api.post<MailTmToken>('/token', { 
      address, 
      password 
    })
    const token = auth.token

    await this.prisma.mail.create({
      data: {
        id: account.id, 
        email: address,
        password: password,
        token: token
      }
    })

    return new TmMail(account.id, token, this.api)
  }
}
