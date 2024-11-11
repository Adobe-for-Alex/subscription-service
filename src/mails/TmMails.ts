import { PrismaClient } from '@prisma/client'
import Mails from './Mails'
import Mail from '../mail/Mail'

export default class TmMails implements Mails {
  constructor(
    private readonly prisma: PrismaClient
  ) { }
  mail(address: string, password: string): Promise<Mail> {
    throw new Error("Method not implemented.")
  }
}
