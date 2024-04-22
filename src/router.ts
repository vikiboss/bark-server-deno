import { Router } from 'jsr:@oak/oak@14'
import { INFO } from './constants.ts'
import { Handler } from './handler.ts'
import { Utils } from './util.ts'
import { db } from './db.ts'
import { readAllSync } from 'jsr:@std/io@0.218/read_all'

const rootRouter = new Router()

const isAllowNewDevice = false

// for health check
rootRouter.all('/ping', Handler.createResHandler('pong', 200))
rootRouter.all('/healthz', Handler.createResHandler('ok', 200))

// for info
rootRouter.all('/info', Handler.createResHandler('success', 200, { ...INFO, devices: 0 }))

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

rootRouter.post('/push', ctx => Handler.push(ctx, Handler.normalizeParams(ctx)))

// for push
rootRouter.all('/:key/:body', async ctx => {
  const { key, body } = ctx.params
  Handler.push(ctx, Handler.normalizeParams(ctx, key, body))
})

rootRouter.all('/:key/:title/:body', ctx => {
  const { key, title, body } = ctx.params
  Handler.push(ctx, Handler.normalizeParams(ctx, key, title, body))
})

rootRouter.all('/:key/:category/:title/:body', ctx => {
  const { key, category, title, body } = ctx.params
  Handler.push(ctx, Handler.normalizeParams(ctx, key, category, title, body))
})

export { rootRouter }
