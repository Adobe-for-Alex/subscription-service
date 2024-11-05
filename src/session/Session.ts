import { Json } from '../aliases'

export default interface Session {
  updated(): Promise<boolean>
  delete(): Promise<void>
  asJson(): Promise<Json>
}
