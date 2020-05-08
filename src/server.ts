import http from 'http'
import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import compression from 'compression'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'

import * as views from './views'

dotenv.config()

const PORT = process.env.PORT || 80
const app: Application = express()

const fragmentUrl = `${process.env.FRAGMENT_PROTOCOL}://${process.env.FRAGMENT_HOST}`

app.disable('x-powered-by')

app.use(bodyParser.json())

app.use(compression())

app.use(cors())

enum FragmentResponseType {
  State = 'state',
  Script = 'script',
  Style = 'style',
  Content = 'content'
}

enum FragmentName {
  Header = 'eft'
}

interface FragmentResponse {
  name: string
  type: FragmentResponseType
  content: any
}

const fragments = {
  [FragmentName.Header]: {
    port: 81
  }
}

const readFragment = (fragmentName: FragmentName, onData, onEnd): void => {
  const fragment = fragments[fragmentName]

  http.get(`${fragmentUrl}:${fragment.port}`, function (fragmentResponse) {
    fragmentResponse.on('data', function (chunk) {
      onData?.(JSON.parse(chunk))
    })

    fragmentResponse.on('end', function () {
      onEnd?.()
    })
  })
}

const writeFragment = (res, { type, content }: FragmentResponse): void => {
  switch (type) {
    case FragmentResponseType.Content:
      res.write(content)
      break
    case FragmentResponseType.Script:
      res.write(`<script src="${content}"></script>`)
      break

    default:
      break
  }
}

app.get('*', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')

  // Html page top and common libraries
  res.write(views.top)

  const onData = (data: FragmentResponse): void => writeFragment(res, data)

  // Html page end and res end
  const onEnd = () => {
    res.write(views.bottom)
    res.end()
  }

  // Content
  readFragment(FragmentName.Header, onData, onEnd)
})

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`)

  if (process.send) {
    process.send('online')
  }
})

export default app
