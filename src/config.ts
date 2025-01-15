export type Config = {
  adobeApi: URL,
  updateConsumers: URL[]
}

export const loadConfig = (): Config => {
  const {
    ADOBE_API_URL,
    SESSION_UPDATED_WEBHOOK_URL
  } = process.env
  if (!ADOBE_API_URL) throw new Error('ADOBE_API_URL is undefined')
  if (!SESSION_UPDATED_WEBHOOK_URL) throw new Error('SESSION_UPDATED_WEBHOOK_URL is undefined')
  return {
    adobeApi: new URL(ADOBE_API_URL),
    updateConsumers: SESSION_UPDATED_WEBHOOK_URL.split(';').map(x => new URL(x))
  }
}
