import { PrismaClient } from '@prisma/client'
import Adobe from './Adobe'
import Account from '../account/Account'
import { AxiosInstance } from 'axios'
import AdobeAccount from '../account/AdobeAccount'

type Board = {
  id: string,
  subscription: boolean,
  user_limit: number,
  users: string[]
}

export default class AdobeApi implements Adobe {
  constructor(
    private readonly api: AxiosInstance,
    private readonly prisma: PrismaClient
  ) { }

  async account(address: string, password: string): Promise<Account> {
    const mail = await this.prisma.mail.findFirstOrThrow({
      select: { id: true },
      where: { email: address }
    })
    const account = await this.prisma.account.findUnique({
      where: { mailId: mail.id }
    }) || await (async () => {
      const newAccountId = await this.api.post<string>('/users', { email: address, password }).then(x => x.data)
      const boards = await this.api.get<Board[]>('/boards').then(x => x.data)
      const board = boards.find(x => x.users.length < x.user_limit)
      if (!board) throw new Error('No available boards')
      await this.api.put(`/users/${newAccountId}`, { board: board.id })
      return await this.prisma.account.create({
        data: { id: newAccountId, mailId: mail.id, password }
      })
    })()
    return new AdobeAccount(this.api, account.id)
  }
}
