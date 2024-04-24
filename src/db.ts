const kvUrl = Deno.env.get('DEV')
  ? `https://api.deno.com/databases/4edfdd1c-0094-4ab8-b5bd-21a7226af5c6/connect`
  : undefined

const kv = await Deno.openKv(kvUrl)

export const db = {
  async getDeviceTokenByKey(key: string = ''): Promise<string | null> {
    if (!key) return null
    return (await kv.get<string>(['deviceToken', key])).value || null
  },
  async saveDeviceTokenByKey(key: string = '', deviceToken: string) {
    if (!key || !deviceToken) return false
    if (key === 'deleted') return await kv.delete(['deviceToken', key])
    return (await kv.set(['deviceToken', key], deviceToken)).ok
  },
}
