import dotenv from 'dotenv'
import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import hyperquest from 'hyperquest'
import through from 'through2'
import pump from 'pump'
// import { getContents } from './utils'

dotenv.config()

const PORT = process.env.PORT || 80
const app: Application = express()

app.set('views', 'views')
app.set('view engine', 'pug')

app.use(bodyParser.json())

app.use(cors())

app.get('*', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')

  res.write(`<!DOCTYPE html>
      <html>
        <head>
          <title>Client</title>
        </head>
        <body>`)

  const write = (row, enc, next) => {
    const data = JSON.parse(String(row))
    data.html && res.write(data.html)
    // data.script && res.write(data.script)
    next()
  }

  pump(hyperquest('http://localhost:81'), through(write), () => {
    res.write(`</body></html>`)
    res.end()
  })
})

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`)
})

export default app
