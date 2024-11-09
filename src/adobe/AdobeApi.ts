import { PrismaClient } from '@prisma/client'
import Adobe from './Adobe'
import Account from '../account/Account'

export default class AdobeApi implements Adobe {
  constructor(
    private readonly baseUrl: URL,
    private readonly prisma: PrismaClient
  ) { }
  account(address: string, password: string): Promise<Account> {
    throw new Error("Method not implemented.")
  }
}
