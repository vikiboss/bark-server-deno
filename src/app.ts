import { BARK_KEY } from './env.ts'
import { Handler } from './handler.ts'
import { Utils } from './util.ts'

Deno.serve(async (req: Request) => {
  const { pathname, searchParams } = new URL(req.url)

  const isAuthenticated = searchParams.get('key') === BARK_KEY

  // public routes
  switch (pathname) {
    case '/':
      return Utils.createRes('Bark Server (Deno Deploy) is running', 200)
    case '/healthz':
      return new Response('ok')
    case '/ping':
      return Utils.createRes('pong', 200)

    case '/test':
      Deno.env.set('BARK_TEST', Date.now().toString())
      return Utils.createRes('try to write', 200)

    // mock to be compatible with the Bark iOS App
    case '/register':
      const { device_token = '' } = JSON.parse((await req.text()) || '{}')
      const device_key = 'YouShouldEditItOnDenoDeploy'

      return Utils.createRes('success', 200, { key: device_key, device_key, device_token })
    case '/register/YouShouldEditItOnDenoDeploy':
      return Utils.createRes('success', 200)
  }

  if (!isAuthenticated) {
    return Handler.noAuth()
  }

  // authenticated routes
  switch (pathname) {
    case '/info':
      return Handler.info()
    default:
      return Handler.pushNotification(req)
  }
})
