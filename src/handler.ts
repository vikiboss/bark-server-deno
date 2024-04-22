import { db } from './db.ts'
import { Utils } from './util.ts'
import { BarkAPNs } from './apns.ts'
import { BARK_DEFAULT_ICON, BARK_DEFAULT_SOUND, INFO } from './constants.ts'
import { RouterContext } from 'jsr:@oak/oak@14/router'

export class Handler {
  static barkAPNsService = new BarkAPNs()

  static getInfo(isAllowQueryNums: boolean = false) {
    return { ...INFO, devices: isAllowQueryNums ? 1 : 0 }
  }

  static createResHandler(
    message: unknown,
    code: number = 200,
    extraProps: Record<string, unknown> = {}
  ) {
    return (ctx: { response: { status: number; body: any } }) => {
      ctx.response.status = code
      ctx.response.body = Utils.createRes(message, code, extraProps)
    }
  }

  static async pushNotification(req: Request) {
    const { searchParams } = new URL(req.url)

    const isGetRequest = req.method === 'GET'
    const payload: Record<string, any> = {}

    if (isGetRequest) {
      searchParams.forEach((value, key) => (payload[key] = value))
    } else {
      Object.entries(await req.json()).forEach(([key, value]) => (payload[key] = value))
    }

    const [key = '', token = ''] = [payload.device_key, payload.device_token]

    if (!key && !token) {
      return Utils.createRes('failed to push: device key is required', 400)
    }

    const deviceToken = ''

    if (!deviceToken) {
      return Utils.createRes(`failed to push: device_token is required`, 400)
    }

    const _soundName = payload.sound || BARK_DEFAULT_SOUND || 'healthnotification'
    const soundName = _soundName.includes('.') ? _soundName : `${_soundName}.caf`

    const response = await Handler.barkAPNsService.push(
      deviceToken,
      {
        alert: {
          body: payload.body,
          title: payload.title,
          subtitle: payload.subtitle,
        },
        badge: 0,
        category: payload.category,
        sound: {
          name: soundName,
          critical: payload.soundCritical ?? 0,
          volume: payload.soundVolume ?? 1.0,
        },
        'thread-id': payload.group ?? 'Default',
        'mutable-content': 1,
      },
      {
        badge: payload.badge,
        isArchive: payload.isArchive ?? '1',
        icon:
          payload.icon ||
          BARK_DEFAULT_ICON ||
          'https://img-share.viki.moe/file/a6512aa634f301dfd37e9.png',
        ciphertext: payload.ciphertext,
        level: payload.level,
        url: payload.url,
        copy: payload.copy,
        autoCopy: payload.autoCopy,
      }
    )

    if (response.status === 200) {
      return Utils.createRes('success', 200, { resFromApple: await response.text() })
    } else {
      try {
        return Utils.createRes(`push failed: ${await response.text()}`, response.status)
      } catch {
        return Utils.createRes('push failed: unknown error', response.status)
      }
    }
  }

  static async push<T extends string>(ctx: RouterContext<T>, params: Record<string, any> = {}) {
    const deviceToken =
      (await db.deviceTokenByKey(params.key)) ??
      params.deviceToken ??
      params.devicetoken ??
      params.device_token

    if (!deviceToken) {
      return Handler.createResHandler(`failed to push: device_token is required`, 400)(ctx)
    }

    const _soundName = params.sound || BARK_DEFAULT_SOUND || 'healthnotification'
    const soundName = _soundName.includes('.') ? _soundName : `${_soundName}.caf`

    const response = await Handler.barkAPNsService.push(
      deviceToken,
      {
        alert: {
          body: params.body,
          title: params.title,
          subtitle: params.subtitle,
        },
        badge: 0,
        category: params.category,
        sound: {
          name: soundName,
          critical: params.soundCritical ?? 0,
          volume: params.soundVolume ?? 1.0,
        },
        'thread-id': params.group ?? 'Default',
        'mutable-content': 1,
      },
      {
        badge: params.badge,
        isArchive: params.isArchive ?? '1',
        icon:
          params.icon ||
          BARK_DEFAULT_ICON ||
          'https://img-share.viki.moe/file/a6512aa634f301dfd37e9.png',
        ciphertext: params.ciphertext,
        level: params.level,
        url: params.url,
        copy: params.copy,
        autoCopy: params.autoCopy,
      }
    )

    if (response.status === 200) {
      return Handler.createResHandler('success', 200, { resFromApple: await response.text() })(ctx)
    } else {
      try {
        const info = `push failed: ${await response.text()}`
        return Handler.createResHandler(info, response.status)(ctx)
      } catch {
        return Handler.createResHandler('push failed: unknown error', response.status)(ctx)
      }
    }
  }

  static async normalizeParams<T extends string>(
    ctx: RouterContext<T>,
    key?: string,
    body?: string,
    title?: string,
    category?: string
  ) {
    const isGet = ctx.request.method === 'GET'
    const isJSON = ctx.request.headers.get('content-type')?.includes('application/json')
    const isFormDataType = ctx.request.headers.get('content-type')?.includes('multipart/form-data')

    const { searchParams } = new URL(ctx.request.url)
    const params = Object.fromEntries(searchParams.entries())

    const resetParams = isGet
      ? params
      : isJSON
      ? await ctx.request.body.json()
      : isFormDataType
      ? Object.fromEntries((await ctx.request.body.formData()).entries())
      : params

    return { key, title, body, category, ...resetParams }
  }
}
