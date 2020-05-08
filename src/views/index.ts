import { oneLineTrim } from 'common-tags'

export const top = oneLineTrim`<!DOCTYPE html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Client</title>
    <script crossorigin="crossorigin" src="https://unpkg.com/react@16/umd/react.development.js"></script>
    <script crossorigin="crossorigin" src="https://unpkg.com/react-dom@16/umd/react-dom.development.js"></script>
    <script crossorigin="crossorigin" src="https://unpkg.com/react-router/umd/react-router.min.js"></script>
    <script crossorigin="crossorigin" src="https://unpkg.com/react-router-dom/umd/react-router-dom.min.js"></script>
  </head>
  <body>`

export const bottom = oneLineTrim`</body></html>`
