import { Router } from 'jsr:@oak/oak@14'

import { db } from './db.ts'
import { Utils } from './util.ts'
import { Handler } from './handler.ts'

const rootRouter = new Router()

const isAllowQueryNums = false
const isAllowNewDevice = false

// for health check
rootRouter.all('/ping', Handler.createResHandler('pong', 200))
rootRouter.all('/healthz', Handler.createResHandler('ok', 200))

// for info
rootRouter.all('/info', Handler.createResHandler('success', 200, Handler.getInfo(isAllowQueryNums)))

// for register
rootRouter.all('/register', async ctx => {
  const { searchParams } = new URL(ctx.request.url)
  const deviceToken = searchParams.get('devicetoken')
  let key = searchParams.get('key')

  if (!deviceToken) {
    return Handler.createResHandler('ok', 200)(ctx)
  }

  if (!(key && (await db.deviceTokenByKey(key)))) {
    if (isAllowNewDevice) {
      key = Utils.shortUUID()
    } else {
      return Handler.createResHandler('device registration failed: register disabled', 500)(ctx)
    }
  }

  await db.saveDeviceTokenByKey(key, deviceToken)

  const data = {
    key: key,
    device_key: key,
    device_token: deviceToken,
  }

  return Handler.createResHandler('ok', 200, { data })(ctx)
})

// for POST push
rootRouter.post('/push', ctx => Handler.push(ctx, Handler.normalizeParams(ctx)))

const methods = ['get', 'post'] as const

// for path params push (GET/POST)
methods.forEach(e =>
  rootRouter[e]('/:key/:body', async ctx => {
    const { key, body } = ctx.params
    Handler.push(ctx, Handler.normalizeParams(ctx, key, body))
  })
)
methods.forEach(e =>
  rootRouter[e]('/:key/:title/:body', ctx => {
    const { key, title, body } = ctx.params
    Handler.push(ctx, Handler.normalizeParams(ctx, key, title, body))
  })
)
methods.forEach(e =>
  rootRouter[e]('/:key/:category/:title/:body', ctx => {
    const { key, category, title, body } = ctx.params
    Handler.push(ctx, Handler.normalizeParams(ctx, key, category, title, body))
  })
)

export { rootRouter }
