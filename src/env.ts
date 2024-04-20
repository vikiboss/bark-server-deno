export interface EnvDevice {
  key: string
  token: string
}

export const BARK_KEY = Deno.env.get('BARK_KEY') ?? ''
export const BARK_DEVICES = JSON.parse(Deno.env.get('BARK_DEVICES') ?? '[]') as EnvDevice[]
