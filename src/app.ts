import { Application } from 'jsr:@oak/oak@14'
import { rootRouter } from './router.ts'

const app = new Application()

// routes for the app
app.use(rootRouter.routes())
app.use(rootRouter.allowedMethods())

// fallback to Not Found middleware
app.use(ctx => {
  ctx.response.status = 404
  ctx.response.body = { message: 'Not Found' }
})

export { app }
