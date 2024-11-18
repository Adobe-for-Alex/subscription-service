import { PrismaClient } from '@prisma/client'
import { Json, SessionId } from '../aliases'
import Session from './Session'
import Adobe from '../adobe/Adobe'

export default class SessionInPrisma implements Session {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly id: SessionId,
    private readonly adobe: Adobe
  ) { }
  updated(): Promise<boolean> {
    throw new Error("Method not implemented.")
  }
  delete(): Promise<void> {
    throw new Error("Method not implemented.")
  }
  asJson(): Promise<Json> {
    throw new Error("Method not implemented.")
  }
}
