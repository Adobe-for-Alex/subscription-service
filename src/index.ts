import { PrismaClient } from '@prisma/client'
import express from 'express'
import AdobeApi from './adobe/AdobeApi'
import SessionsInPrisma from './sessions/SessionsInPrisma'
import asyncHandler from 'express-async-handler'
import axios from 'axios'
import AdobeWithAutoMails from './adobe/AdobeWithAutoMails'
import TmMails from './mails/TmMails'

const prisma = new PrismaClient()
const sessions = new SessionsInPrisma(
  prisma,
  new AdobeWithAutoMails(
    new TmMails(prisma),
    new AdobeApi(axios.create({ baseURL: 'http://adobe-api/' }), prisma)
  )
)
const app = express()

app.post('/sessions', asyncHandler(async (_, res) => {
  res.json(await sessions.session().then(x => x.asJson()))
}))

app.get('/sessions/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  if (!id) {
    res.status(400).json('Session ID is undefined')
    return
  }
  const session = await sessions.withId(id)
  if (!session) {
    res.status(404).json('Not found')
    return
  }
  res.json(await session.asJson())
}))

app.delete('/sessions/:id', asyncHandler(async (req, res) => {
  const { id } = req.params
  if (!id) {
    res.status(400).json('Session ID is undefined')
    return
  }
  const session = await sessions.withId(id)
  if (!session) {
    res.status(404).json('Not found')
    return
  }
  await session.delete()
  res.json('Deleted')
}))

app.listen(8080, () => console.log('Server started'))

const webhookUrl = process.env['SESSION_UPDATED_WEBHOOK_URL']
if (!webhookUrl) throw new Error('SESSION_UPDATED_WEBHOOK_URL is undefined')
setInterval(async () => {
  const updates = await sessions.allUpdated()
  for (const session of updates) {
    await axios.post(webhookUrl, await session.asJson())
  }
}, 24 * 3600 * 1000)
