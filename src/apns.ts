import { Utils } from './util.ts'

const AUTH_KEY = `
-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg4vtC3g5L5HgKGJ2+
T1eA0tOivREvEAY2g+juRXJkYL2gCgYIKoZIzj0DAQehRANCAASmOs3JkSyoGEWZ
sUGxFs/4pw1rIlSV2IC19M8u3G5kq36upOwyFWj9Gi3Ejc9d3sC7+SHRqXrEAJow
8/7tRpV+
-----END PRIVATE KEY-----
`

export class BarkAPNs {
  static TOPIC = 'me.fin.bark'
  static APNS_HOST_NAME = 'api.push.apple.com'

  static AUTH_KEY_ID = 'LH4T9V5U4R'
  static AUTH_KEY_TEAM_ID = '5U8LBRXG3A'

  static BARK_AUTH_KEY_PEM = AUTH_KEY.replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '')
    .trim()

  private token = ''
  private tokenExpiredAt = 0

  async generateAuthToken() {
    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      Utils.base64ToArrayBuffer(BarkAPNs.BARK_AUTH_KEY_PEM),
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    )

    const JWT_HEADER = Utils.base64UrlEncode(
      JSON.stringify({ alg: 'ES256', kid: BarkAPNs.AUTH_KEY_ID })
    )

    const JWT_CLAIMS = Utils.base64UrlEncode(
      JSON.stringify({ iss: BarkAPNs.AUTH_KEY_TEAM_ID, iat: Utils.timestamp(true) })
    )

    const dataToSign = new TextEncoder().encode(`${JWT_HEADER}.${JWT_CLAIMS}`)
    const signature = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      privateKey,
      dataToSign
    )

    const JWT_SIGNATURE = Utils.base64UrlEncode(String.fromCharCode(...new Uint8Array(signature)))

    return `${JWT_HEADER}.${JWT_CLAIMS}.${JWT_SIGNATURE}`
  }

  async getAPNsAuthToken() {
    if (!this.token || this.tokenExpiredAt <= Date.now()) {
      this.token = await this.generateAuthToken()
      this.tokenExpiredAt = Date.now() + 30 * 60 * 1000
    }

    return this.token
  }

  async push(deviceToken: string, aps: APSContent, barkExtParams?: BarkExtParams) {
    const pushUrl = `https://${BarkAPNs.APNS_HOST_NAME}/3/device/${deviceToken}`
    const authToken = await this.getAPNsAuthToken()

    return await fetch(pushUrl, {
      method: 'POST',
      headers: {
        'apns-topic': BarkAPNs.TOPIC,
        'apns-push-type': 'alert',
        authorization: `bearer ${authToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ aps: { ...aps }, ...barkExtParams }),
    })
  }
}

export interface AlertDictionary {
  title?: string
  subtitle?: string
  body?: string
  'launch-image'?: string
  'title-loc-key'?: string
  'title-loc-args'?: string[]
  'subtitle-loc-key'?: string
  'subtitle-loc-args'?: string[]
  'loc-key'?: string
  'loc-args'?: string[]
}

export interface SoundDictionary {
  critical?: number
  name?:
    | 'alarm'
    | 'anticipate'
    | 'bell'
    | 'birdsong'
    | 'bloom'
    | 'calypso'
    | 'chime'
    | 'choo'
    | 'descent'
    | 'electronic'
    | 'fanfare'
    | 'glass'
    | 'gotosleep'
    | 'healthnotification'
    | 'horn'
    | 'ladder'
    | 'mailsent'
    | 'minuet'
    | 'multiwayinvitation'
    | 'newmail'
    | 'newsflash'
    | 'noir'
    | 'paymentsuccess'
    | 'shake'
    | 'sherwoodforest'
    | 'silence'
    | 'spell'
    | 'suspense'
    | 'telegraph'
    | 'tiptoes'
    | 'typewriters'
    | 'update'
  volume?: number
}

export interface APSContent {
  alert?: string | AlertDictionary
  badge?: number
  sound?: string | SoundDictionary
  'thread-id'?: string
  category?: string
  'content-available'?: number
  'mutable-content'?: number
  'target-content-id'?: string
  'interruption-level'?: string
  'relevance-score'?: number
  'filter-criteria'?: string
  'stale-date'?: number
  'content-state'?: object
  timestamp?: number
  event?: string
  'dismissal-date'?: number
  'attributes-type'?: string
  attributes?: object
}

export interface BarkExtParams {
  /**
   * - active: immediately light up to display the notification
   * - timeSensitive: time-sensitive notifications, can display in focus mode
   * - passive: merely add to the notification center but do not light up to display
   */
  level?: 'active' | 'timeSensitive' | 'passive'
  /**
   * content to copy
   */
  copy?: string
  /**
   * Whether to automatically copy the content to the clipboard
   */
  autoCopy?: boolean
  ciphertext?: string
  url?: string
  icon?: string
  isArchive?: number
  badge?: number
}
