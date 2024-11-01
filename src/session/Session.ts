import {Json} from '../aliases'

export interface Session {
  create(): Promise<Session>
  delete(): Promise<void>
  asJson(): Promise<Json>
}