import { Utils } from './util.ts'
import { BarkAPNs } from './apns.ts'
import { BARK_DEFAULT_ICON, BARK_DEVICES } from './constants.ts'

export class Handler {
  static barkAPNsService = new BarkAPNs()

  static async status() {
    return Utils.createRes('success', 200, {
      devices: BARK_DEVICES,
    })
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

    const { token: deviceToken = token } = BARK_DEVICES.find(e => e.key === key.toLowerCase()) || {}

    if (!deviceToken) {
      return Utils.createRes(`failed to push: device_token is required`, 400)
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
          name: payload.sound || BARK_DEFAULT_ICON || 'healthnotification',
          critical: payload.soundCritical ?? 0,
          volume: payload.soundVolume ?? 1.0,
        },
        'thread-id': payload.group,
        'mutable-content': 1,
      },
      {
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
      return Utils.createRes('success', 200, {
        apnsResponse: response,
      })
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
