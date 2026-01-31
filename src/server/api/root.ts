import { createCallerFactory, createTRPCRouter } from "@/server/api/init"
import { qrCodeRouter } from "@/server/api/routers/qrcode"

export const appRouter = createTRPCRouter({
  qrCode: qrCodeRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
