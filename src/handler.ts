import { Utils } from './util.ts'
import { BarkAPNs } from './apns.ts'
import { BARK_DEVICES } from './env.ts'

export class Handler {
  static barkAPNsService = new BarkAPNs()

  static async info() {
    return Utils.createRes('success', 200, {
      version: 'v1.0.0',
      build: '2024-04-20 18:00:00',
      arch: 'TypeScript (Deno Deploy)',
      devices: BARK_DEVICES,
    })
  }

  static noAuth() {
    return Utils.createRes('unauthorized', 400)
  }

  static async pushNotification(req: Request) {
    const { pathname, searchParams } = new URL(req.url)

    const isGetRequest = req.method === 'GET'

    const contentType = req.headers.get('content-type') || ''
    const isBodyJSON = contentType?.includes('application/json')
    const isBodyForm = contentType?.includes('application/x-www-form-urlencoded')

    const payload: Record<string, any> = {}
    const pathnameParams = pathname.split('/').filter(Boolean)

    if (pathnameParams.length === 2) {
      ;[payload.device_Key, payload.body] = pathnameParams
    } else if (pathnameParams.length === 3) {
      ;[payload.device_Key, payload.title, payload.body] = pathnameParams
    } else if (pathnameParams.length === 4) {
      ;[payload.device_Key, payload.category, payload.title, payload.body] = pathnameParams
    }

    if (isGetRequest) {
      searchParams.forEach((value, key) => (payload[key] = value))
    } else {
      if (isBodyJSON) {
        ;(await req.json()).forEach((value: string, key: string) => (payload[key] = value))
      } else if (isBodyForm) {
        ;(await req.formData()).forEach((value, key) => (payload[key] = value as string))
      }
    }

    const key = payload.device_Key

    if (!key) {
      return Utils.createRes('failed to push: device key is required', 400)
    }

    const deviceToken = BARK_DEVICES.find(e => e.key === key)?.token

    if (!deviceToken) {
      return Utils.createRes(`failed to get device token from key 「${key}」`, 400)
    }

    const response = await Handler.barkAPNsService.push(
      deviceToken,
      {
        alert: {
          body: payload.body,
          title: payload.title,
          subtitle: payload.subtitle,
        },
        badge: payload.badge,
        category: payload.category,
        sound: {
          name: payload.sound ?? 'healthnotification',
          critical: payload.soundCritical ?? 0,
          volume: payload.soundVolume ?? 1.0,
        },
        'thread-id': payload.group,
        'mutable-content': 1,
      },
      {
        isArchive: payload.isArchive,
        icon: payload.icon,
        ciphertext: payload.ciphertext,
        level: payload.level,
        url: payload.url,
        copy: payload.copy,
        autoCopy: payload.autoCopy,
      }
    )

    if (response.status === 200) {
      return Utils.createRes('success', 200)
    } else {
      try {
        const message = `push failed: ${JSON.parse(await response.text()).reason}`
        return Utils.createRes(message, response.status)
      } catch {
        return Utils.createRes('push failed: unknown error', response.status)
      }
    }
  }
}
