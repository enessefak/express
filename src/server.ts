import dotenv from 'dotenv'
import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import compression from 'compression'
import bodyParser from 'body-parser'
import hyperquest from 'hyperquest'
import through from 'through2'
import pump from 'pump'

dotenv.config()

const PORT = process.env.PORT || 80
const app: Application = express()

app.set('views', 'views')
app.set('view engine', 'pug')

app.use(bodyParser.json())

app.use(compression())

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
    try {
      const data = JSON.parse(String(row))
      data.html && res.write(data.html)
      data.script &&
        res.write(`<script crossorigin="crossorigin" src="https://unpkg.com/react@16/umd/react.development.js"></script>
      <script crossorigin="crossorigin" src="https://unpkg.com/react-dom@16/umd/react-dom.development.js"></script>
      <script crossorigin="crossorigin" src="https://unpkg.com/react-router/umd/react-router.min.js"></script>
      <script crossorigin="crossorigin" src="https://unpkg.com/react-router-dom/umd/react-router-dom.min.js"></script>
      ${data.script}`)
    } catch (error) {
      console.error(error)
    }

    next()
  }

  const fragment = [
    hyperquest(`http://localhost:81${req.url}`),
    through(write),
    () => {
      res.write(`</body></html>`)
      res.end()
    }
  ]

  pump(...fragment)
})

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`)
})

export default app
