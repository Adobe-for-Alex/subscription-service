import { PrismaClient } from '@prisma/client'
import express, { NextFunction, Request, Response } from 'express'
import AdobeApi from './adobe/AdobeApi'
import SessionsInPrisma from './sessions/SessionsInPrisma'
import asyncHandler from 'express-async-handler'
import axios from 'axios'
import AdobeWithAutoMails from './adobe/AdobeWithAutoMails'
import TmMails from './mails/TmMails'

const adobeApiUrl = process.env['ADOBE_API_URL']
if (!adobeApiUrl) throw new Error('ADOBE_API_URL is undefined')
const prisma = new PrismaClient()
const sessions = new SessionsInPrisma(
  prisma,
  new AdobeWithAutoMails(
    new TmMails(prisma),
    new AdobeApi(axios.create({ baseURL: adobeApiUrl }), prisma)
  )
)
const app = express()

let serviceBusy = false

app.post('/sessions', asyncHandler(async (_, res) => {
  if (serviceBusy) {
    res.status(509).send('Service busy')
    return
  }
  try {
    serviceBusy = true
    res.json(await sessions.session().then(x => x.asJson()))
  } finally {
    serviceBusy = false
  }
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

app.use((err: Error, _1: Request, res: Response, _2: NextFunction) => {
  res.status(500).send('Internal error')
  console.error(err.toString())
  console.error(err.stack)
  if ('errors' in err && err.errors instanceof Array) {
    for (const error of err.errors) {
      console.error(error.toString())
    }
  }
})

app.listen(8080, () => console.log('Server started'))

const webhookUrl = process.env['SESSION_UPDATED_WEBHOOK_URL']
if (webhookUrl) {
  const updateAll = async () => {
    while (serviceBusy) await new Promise(r => setTimeout(r, 1000))
    try {
      serviceBusy = true
      console.log('Update session')
      const updates = await sessions.allUpdated()
      console.log('Candidates', updates)
      for (const session of updates) {
        console.log('Was be updated session', await session.asJson())
        console.log('Update result', await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(await session.asJson()),
        }))
      }
    } finally {
      serviceBusy = false
    }
  }
  updateAll()
  setInterval(updateAll, 24 * 3600 * 1000)
} else {
  console.warn('Notification about sessions updates disablead because SESSION_UPDATED_WEBHOOK_URL is undefined')
}
