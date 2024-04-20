import { Utils } from './util.ts'
import { BarkAPNs } from './apns.ts'
import { BARK_DEFAULT_ICON, BARK_DEFAULT_SOUND, BARK_DEVICES } from './constants.ts'

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
}
