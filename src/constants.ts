export interface EnvDevice {
  key: string
  token: string
}

// env on deno deploy
export const BARK_KEY = Deno.env.get('BARK_KEY') ?? ''
export const BARK_DEVICES = JSON.parse(Deno.env.get('BARK_DEVICES') ?? '[]') as EnvDevice[]
export const BARK_DEFAULT_ICON = Deno.env.get('BARK_ICON') ?? ''
export const BARK_DEFAULT_SOUND = Deno.env.get('BARK_SOUND') ?? ''

export const PLATFORM = 'Deno Deploy'
export const VERSION = 'v1.0.0'
export const START_TIME = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
