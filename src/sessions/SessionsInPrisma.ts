import { PrismaClient } from '@prisma/client'
import Sessions from './Sessions'
import Adobe from '../adobe/Adobe'
import Session from '../session/Session'
import { SessionId } from '../aliases'

export default class SessionsInPrisma implements Sessions {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly adobe: Adobe
  ) { }
  all(): Promise<Session[]> {
    throw new Error("Method not implemented.")
  }
  session(): Promise<Session> {
    throw new Error("Method not implemented.")
  }
  withId(id: SessionId): Promise<Session | undefined> {
    throw new Error("Method not implemented.")
  }
}
