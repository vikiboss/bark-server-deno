export class Utils {
  static timestamp(): number {
    return Math.floor(Date.now() / 1000)
  }

  static base64ToArrayBuffer(base64: string): Uint8Array {
    return Uint8Array.from(globalThis.atob(base64), v => v.charCodeAt(0))
  }

  static uuid(): string {
    const length = 22
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

    let customUUID = ''

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length)
      customUUID += characters[randomIndex]
    }

    return customUUID
  }

  static createRes(message: unknown, code: number = 200, extraProps: Record<string, unknown> = {}) {
    return new Response(
      JSON.stringify({
        ...extraProps,
        message: message,
        code: code,
        timestamp: Utils.timestamp(),
      }),
      { status: code }
    )
  }
}
