import { Json } from '../aliases'

export default interface Session {
  delete(): Promise<void>
  validate(): Promise<void>
  asJson(): Promise<Json>
}
