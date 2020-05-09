import path from 'path'
import fs from 'fs'
import http from 'http'
import url from 'url'
import express, { Application, Request, Response, NextFunction } from 'express'
import cors from 'cors'
import compression from 'compression'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'

import * as views from './views'

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

dotenv.config()

const PORT = process.env.PORT || 80
const app: Application = express()

app.set('views', path.join(__dirname, './views'))
app.set('view engine', 'html')

// define the template engine
app.engine('html', (filePath: string, options: any, callback: any) =>
  fs.readFile(filePath, (err, content: Buffer) => {
    if (err) return callback(err)
    const fragments = { ...options.fragments }
    let rendered = ''
    const template = String(content)
    rendered = Object.keys(fragments).reduce((p, c) => p.split(`#${c}#`).join(fragments[c]), template)

    return callback(null, rendered)
  })
)

app.disable('x-powered-by')

app.use(bodyParser.json())

app.use(compression())

app.use(cors())

const fragments = {
  [FragmentName.Header]: {
    port: 81
  }
}

const readFragment = (fragmentName: FragmentName, onData, onEnd): void => {
  const fragment = fragments[fragmentName]

  const requestUrl = url.parse(
    url.format({
      protocol: process.env.FRAGMENT_PROTOCOL,
      hostname: process.env.FRAGMENT_HOST,
      port: fragment.port,
      pathname: '/',
      query: {
        token: ''
      }
    })
  )

  http.get(requestUrl, fragmentResponse => {
    fragmentResponse.on('data', chunk => onData?.(JSON.parse(chunk)))
    fragmentResponse.on('end', () => onEnd?.())
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

const readPromiseFragment = (...fragmentName: FragmentName[]): Promise<any> =>
  Promise.all([
    ...fragmentName.map(
      fragmentName =>
        new Promise(resolve => {
          let fragmentContent = ''

          const onData = ({ type, content }: FragmentResponse): void => {
            if (type === FragmentResponseType.Content) {
              fragmentContent += content
            }
          }

          const onEnd = (): void => resolve(fragmentContent)

          readFragment(fragmentName, onData, onEnd)
        })
    )
  ])

app.get('/template', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')

  // Content
  const [header, other] = await readPromiseFragment(FragmentName.Header, FragmentName.Header)
  res.render('index', {
    fragments: {
      header,
      other
    }
  })
})

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
