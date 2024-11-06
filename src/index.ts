import express from 'express'

type SessionId = string
type Session = {
  id: SessionId,
  email: string,
  password: string
}
const sessions: Session[] = []

// https://stackoverflow.com/a/1349426
const makeid = (length: number) => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

const emailHosts = ['example.com', 'gmail.com', 'yandex.ru', 'tm.com']
const randomEmailHost = () => emailHosts[Math.floor(emailHosts.length * Math.random())]

const newSession = (): Session => ({
  id: makeid(32),
  email: `u${makeid(16)}@${randomEmailHost()}`,
  password: makeid(24)
})

const app = express()

app.post('/sessions', (_, res) => {
  const session = newSession()
  sessions.push(session)
  res.json(session.id)
})

app.get('/sessions/:id', (req, res) => {
  const { id } = req.params
  const session = sessions.find(x => x.id === id)
  if (!session) {
    res.status(404).json('Not found')
    return
  }
  res.json(session)
})

app.delete('/sessions/:id', (req, res) => {
  const { id } = req.params
  const session = sessions.find(x => x.id === id)
  if (!session) {
    res.status(404).json('Not found')
    return
  }
  const index = sessions.indexOf(session)
  sessions.splice(index, 1)
  res.json('Deleted')
})

app.listen(8080, () => console.log('Server started'))
