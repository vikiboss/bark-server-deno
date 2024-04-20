import { BARK_KEY } from './env.ts'
import { Handler } from './handler.ts'
import { Utils } from './util.ts'

Deno.serve((req: Request) => {
  const { pathname, searchParams } = new URL(req.url)

  const isAuthenticated = searchParams.get('key') === BARK_KEY

  // public routes
  switch (pathname) {
    case '/':
      return new Response(`Bark Server is running, deployed by Deno Deploy (${Date.now()})`)
    case '/healthz':
      return new Response('ok')
    case '/ping':
      return Utils.createRes('pong', 200)
    case '/registry':
      // mock to be compatible with the Bark iOS App
      return Utils.createRes('success', 200, {
        device_key: 'you-should-config-it-on-deno-deploy',
        device_token: 'you-should-config-it-on-deno-deploy',
      })
  }

  if (!isAuthenticated) {
    return Handler.noAuth()
  }

  // authenticated routes
  switch (pathname) {
    case '/info':
      return Handler.info()
  }

  return Handler.pushNotification(req)
})
