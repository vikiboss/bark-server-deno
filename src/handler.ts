import { Utils } from './util.ts'
import { Database } from './database.ts'

export const Constants = {
  token: 'devicetoken',
}

class Handler {
  build = '2024-04-12 20:57:41'
  arch = 'TS (Deno Deploy)'
  version = 'v1.0.0'
  devices = 0
  commit = ''
  utils = Utils
  db = Database

  async register(params: URLSearchParams) {
    const deviceToken = params.get(Constants.token)

    let key = params.get('key')

    if (!deviceToken) return Utils.createRes('device token is empty', 400)

    if (!(key && (await this.db.getDeviceTokenByKey(key)))) {
      if (await this.db.config.arrowAddNewDevice.get()) {
        key = this.utils.uuid()
      } else {
        return this.utils.createRes('device registration failed: register disabled', 500)
      }
    }

    await this.db.setDeviceTokenByKey(key, deviceToken)

    return this.utils.createRes('success', 200, {
      data: {
        key: key,
        device_key: key,
        device_token: deviceToken,
      },
    })
  }

  ping() {
    return this.utils.createRes('pong', 200)
  }

  healthz() {
    return new Response('ok')
  }

  async info() {
    if (await this.db.config.allowQueryDevice.get()) {
      this.devices = await this.db.getDeviceCount()
    }

    return this.utils.createRes('success', 200, {
      version: this.version,
      build: this.build,
      arch: this.arch,
      commit: this.commit,
      devices: this.devices,
    })
  }

  async push(params: URLSearchParams) {
    const key = params.get('device_key') ?? ''

    if (!key) {
      return this.utils.createRes('failed to push: device key is empty', 400)
    }

    const deviceToken = await this.db.getDeviceTokenByKey(key)

    if (!deviceToken) {
      return this.utils.createRes(`failed to get device token: [${key}] not found`, 400)
    }

    const title = decodeURIComponent(params.get('title') ?? '') || undefined
    const body = decodeURIComponent(params.get('body') ?? 'No Content')

    const soundName = params.get('sound') || '1107'
    const sound = soundName.endsWith('.caf') ? soundName : soundName + '.caf'

    const category = params.get('category') || 'myNotificationCategory'
    const group = params.get('group') || 'Default'
    const isArchive = params.get('isArchive') || undefined
    const icon = params.get('icon') || undefined
    const url = params.get('url') || undefined
    const level = params.get('level') || undefined
    const copy = params.get('copy') || undefined
    const badge = params.get('badge') || 0
    const autoCopy = params.get('autoCopy') || undefined
    const ciphertext = params.get('ciphertext') || undefined

    const aps = {
      aps: {
        alert: {
          action: undefined,
          'action-loc-key': undefined,
          body: body,
          'launch-image': undefined,
          'loc-args': undefined,
          'loc-key': undefined,
          title: title,
          subtitle: undefined,
          'title-loc-args': undefined,
          'title-loc-key': undefined,
          'summary-arg': undefined,
          'summary-arg-count': undefined,
        },
        badge: 0,
        category: category,
        'content-available': undefined,
        'interruption-level': undefined,
        'mutable-content': 1,
        'relevance-score': undefined,
        sound: {
          critical: 0,
          name: sound,
          volume: 1.0,
        },
        'thread-id': group,
        'url-args': undefined,
      },
      // ExtParams
      isarchive: isArchive,
      icon: icon,
      ciphertext: ciphertext,
      level: level,
      url: url,
      copy: copy,
      badge: badge,
      autocopy: autoCopy,
    }

    const apns = new APNs(db)

    const response = await apns.push(deviceToken, aps)

    if (response.status === 200) {
      return new Response(
        JSON.stringify({
          message: 'success',
          code: 200,
          timestamp: Utils.timestamp(),
        }),
        { status: 200 }
      )
    } else {
      return new Response(
        JSON.stringify({
          message: `push failed: ${JSON.parse(await response.text()).reason}`,
          code: response.status,
          timestamp: Utils.timestamp(),
        }),
        { status: response.status }
      )
    }
  }
}

export const handler = new Handler()
