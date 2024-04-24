import { Router } from 'jsr:@oak/oak@14'

import { db } from './db.ts'
import { Utils } from './util.ts'
import { Handler } from './handler.ts'

const rootRouter = new Router()

const isAllowQueryNums = true
const isAllowNewDevice = true

// for health check
rootRouter.all('/ping', Handler.createResHandler('pong', 200))
rootRouter.all('/healthz', Handler.createResHandler('ok', 200))

// for info
rootRouter.all('/info', Handler.createResHandler('success', 200, Handler.getInfo(isAllowQueryNums)))

// for register
rootRouter.all('/register', async (ctx, next) => {
  let { key = '', devicetoken = '', device_token = '' } = await Handler.normalizeParams(ctx)
  const deviceToken = devicetoken || device_token || ''

  if (!deviceToken) {
    return Handler.createResHandler('device token required', 400)(ctx, next)
  }

  const keyHasExistToken = !!(await db.getDeviceTokenByKey(key))

  if (!(key && keyHasExistToken)) {
    if (isAllowNewDevice) {
      key = Utils.randomHash()
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
rootRouter.post('/push', async ctx => Handler.push(ctx, await Handler.normalizeParams(ctx)))

const methods = ['get', 'post'] as const

// for path params push (GET/POST)
methods.forEach(e =>
  rootRouter[e]('/:key/:body', async ctx => {
    const { key, body } = ctx.params
    return Handler.push(ctx, await Handler.normalizeParams(ctx, key, body))
  })
)
methods.forEach(e =>
  rootRouter[e]('/:key/:title/:body', async ctx => {
    const { key, title, body } = ctx.params
    return Handler.push(ctx, await Handler.normalizeParams(ctx, key, title, body))
  })
)
methods.forEach(e =>
  rootRouter[e]('/:key/:category/:title/:body', async ctx => {
    const { key, category, title, body } = ctx.params
    return Handler.push(ctx, await Handler.normalizeParams(ctx, key, category, title, body))
  })
)

export { rootRouter }
