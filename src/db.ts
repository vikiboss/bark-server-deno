const kv = await Deno.openKv()

export const db = {
  async deviceTokenByKey(key: string = ''): Promise<string | null> {
    if (!key) return null
    return (await kv.get<string>(['deviceToken', key])).value || null
  },
  async saveDeviceTokenByKey(key: string = '', deviceToken: string) {
    if (!key || !deviceToken) return false
    return (await kv.set(['deviceToken', key], deviceToken)).ok
  },
}
