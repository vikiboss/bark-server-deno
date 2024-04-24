import { Utils } from './util.ts'

export interface EnvDevice {
  key: string
  token: string
}

// env on deno deploy
export const BARK_KEY = Deno.env.get('BARK_KEY') ?? ''
export const BARK_DEFAULT_ICON = Deno.env.get('BARK_ICON') ?? ''
export const BARK_DEFAULT_SOUND = Deno.env.get('BARK_SOUND') ?? ''

export const PLATFORM = 'Deno Deploy'
export const VERSION = 'v1.0.0'
export const DESCRIPTION = 'A server for sending instant push notifications to iOS via Bark APP.'
export const START_TIME = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
export const INFO = {
  version: VERSION,
  build: '2024-04-24 10:00:00',
  arch: 'TypeScript (Deno Deploy)',
  commit: '6f65b864b763e727ae741a4b9e0431becfeff4aa',
}

export const INFO_RESPONSE = Utils.createRes(DESCRIPTION, 200, {
  data: {
    platform: PLATFORM,
    version: VERSION,
    uptime: START_TIME,
  },
})
