import { atom } from './kv-store.ts'
import { handler } from './handler.ts'



Deno.serve({ port: 3000 }, (req, _res) => {
  const url = new URL(req.url)

  switch (req.url) {
    case '/register':
      return handler.register(url.searchParams)
    case '/healthz':
      return handler.healthz(url.searchParams)
    case '/ping':
      return handler.ping()
  }

  return new Response('/handler')
})
