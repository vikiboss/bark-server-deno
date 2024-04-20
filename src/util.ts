export class Utils {
  static timestamp() {
    return Math.floor(Date.now() / 1000)
  }

  static base64ToArrayBuffer(base64: string): Uint8Array {
    return Uint8Array.from(globalThis.atob(base64), v => v.charCodeAt(0))
  }

  static base64UrlEncode(input: string = '') {
    // replace `+` with `-`, `/` with `_`, and remove trailing `=`
    return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  }

  static createRes(message: unknown, code: number = 200, extraProps: Record<string, unknown> = {}) {
    return new Response(
      JSON.stringify({
        message: message,
        code: code,
        timestamp: Utils.timestamp(),
        ...extraProps,
      }),
      { status: code }
    )
  }
}
