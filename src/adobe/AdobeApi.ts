import { PrismaClient } from '@prisma/client'
import Adobe from './Adobe'
import Account from '../account/Account'
import { AxiosInstance } from 'axios'
import AdobeAccount from '../account/AdobeAccount'

export default class AdobeApi implements Adobe {
  constructor(
    private readonly api: AxiosInstance,
    private readonly prisma: PrismaClient
  ) { }
  async expiredAccounts(): Promise<Account[]> {
    throw new Error('Method not implemented.')
  }
  async account(address: string, password: string): Promise<Account> {
    const mail = await this.prisma.mail.findFirstOrThrow({
      select: { id: true },
      where: { email: address }
    })
    const account = await this.prisma.account.findUnique({
      where: { mailId: mail.id }
    }) || await (async () => {
      await this.api.post('/users', { email: address, password })
      return await this.prisma.account.create({
        data: { id: address, mailId: mail.id, password }
      })
    })()
    return new AdobeAccount(this.api, account.id)
  }
}
