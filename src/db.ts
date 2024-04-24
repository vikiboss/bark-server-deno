const kvUrl = Deno.env.get('DEV')
  ? `https://api.deno.com/databases/3bba7e3b-e240-4d97-a4ec-6df63009d1f4/connect`
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
