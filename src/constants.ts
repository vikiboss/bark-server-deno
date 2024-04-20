export interface EnvDevice {
  key: string
  token: string
}

// env on deno deploy
export const BARK_KEY = Deno.env.get('BARK_KEY') ?? ''
export const BARK_DEVICES = getEnvDeviceList()
export const BARK_DEFAULT_ICON = Deno.env.get('BARK_ICON') ?? ''
export const BARK_DEFAULT_SOUND = Deno.env.get('BARK_SOUND') ?? ''

export const PLATFORM = 'Deno Deploy'
export const VERSION = 'v1.0.0'
export const START_TIME = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })

function getEnvDeviceList() {
  const env = Deno.env.toObject()
  const prefix = 'BARK_DEVICE_'

  return Object.entries(env)
    .filter(([key]) => key.startsWith(prefix))
    .map(([key, value]) => ({
      key: key.replace(prefix, '').toLowerCase(),
      token: value,
    })) as EnvDevice[]
}
