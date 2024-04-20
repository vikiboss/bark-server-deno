import { Handler } from './handler.ts'
import { Utils } from './util.ts'
import { BARK_DEVICES, BARK_KEY, PLATFORM, START_TIME, VERSION } from './constants.ts'

const serverInfoRes = Utils.createRes('success', 200, {
  data: {
    platform: PLATFORM,
    version: VERSION,
    uptime: START_TIME,
    deviceCount: BARK_DEVICES.length,
    description: 'A simple webhook for sending instant push notifications to iOS Bark app.',
  },
})

Deno.serve(async (req: Request) => {
  const { pathname, searchParams } = new URL(req.url)
  const isAuthenticated = searchParams.get('key') === BARK_KEY

  // public routes
  switch (pathname) {
    case '/':
      return serverInfoRes
  }

  if (!isAuthenticated) {
    return Utils.createRes('Unauthorized. Key is required.', 400)
  }

  try {
    // authenticated routes
    switch (pathname) {
      case '/status':
        return Handler.status()
      case '/send':
      case '/push':
        return Handler.pushNotification(req)
      default:
        return serverInfoRes
    }
  } catch (error) {
    return Utils.createRes('failed to push: internal server error', 500, { error })
  }
})
