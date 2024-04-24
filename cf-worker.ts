import { app } from './src/app.ts'

// for cloudflare worker
export default { fetch: app.fetch }
