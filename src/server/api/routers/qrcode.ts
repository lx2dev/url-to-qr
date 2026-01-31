import z from "zod"

import { createTRPCRouter, protectedProcedure } from "@/server/api/init"

export const qrCodeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        url: z.url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {}),
})
