export class Utils {
  static timestamp(ten: boolean = false) {
    return ten ? Math.floor(Date.now() / 1000) : Date.now()
  }

  static base64ToArrayBuffer(base64: string): Uint8Array {
    return Uint8Array.from(globalThis.atob(base64), v => v.charCodeAt(0))
  }

  static base64UrlEncode(input: string = '') {
    // replace `+` with `-`, `/` with `_`, and remove trailing `=`
    return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }

  static randomHash() {
    const length = 22
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const randomValues = crypto.getRandomValues(new Uint8Array(length))

    let customUUID = ''

    for (let i = 0; i < length; i++) {
      customUUID += characters[61 & randomValues[i]]
    }

    return customUUID
  }

  static createRes(message: unknown, code: number = 200, extraProps: Record<string, unknown> = {}) {
    return JSON.stringify({
      message: message,
      code: code,
      timestamp: Utils.timestamp(),
      ...extraProps,
    })
  }
}
