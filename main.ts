import { app } from './src/app.ts'

const port = Number(Deno.env.get('BARK_SERVER_PORT') || 3366)

console.log(`Bark server is running at http://localhost:${port}`)

await app.listen({ port })
