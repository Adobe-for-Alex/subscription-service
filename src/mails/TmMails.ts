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
  ) { }
  async mail(address: string, password: string): Promise<Mail> {
    const mail = await this.prisma.mail.findFirst({
      where: { email: address, password }
    }) || await (async () => {
      console.log('Create email', address, password)
      const createdMail = await this.api.post<MailTmAccount>('/accounts', { address, password })
      console.log('Save email', address, password)
      return await this.prisma.mail.create({
        data: {
          id: createdMail.data.id,
          email: address,
          password: password,
          token: await this.api.post<MailTmToken>('/token', { address, password }).then(x => x.data.token)
        }
      })
    })()
    return new TmMail(mail.id, mail.token, this.api)
  }
}
