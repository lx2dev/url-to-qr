import { TRPCError } from "@trpc/server"
import { and, eq } from "drizzle-orm"
import QRCode from "qrcode"
import z from "zod"

import { createTRPCRouter, protectedProcedure } from "@/server/api/init"
import { qrCodeTable } from "@/server/db/schema"

export const qrCodeRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        url: z.url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.session.user

      const qrData = await QRCode.toDataURL(input.url)

      const qrCode = await ctx.db
        .insert(qrCodeTable)
        .values({
          qrData,
          url: input.url,
          userId,
        })
        .returning()

      return qrCode[0]
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id: userId } = ctx.session.user

      const [qrCode] = await ctx.db
        .select()
        .from(qrCodeTable)
        .where(
          and(eq(qrCodeTable.id, input.id), eq(qrCodeTable.userId, userId)),
        )

      if (!qrCode) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "QR Code not found",
        })
      }

      await ctx.db.delete(qrCodeTable).where(eq(qrCodeTable.id, input.id))

      return {
        success: true,
      }
    }),

  download: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { id: userId } = ctx.session.user

      const [qrCode] = await ctx.db
        .select()
        .from(qrCodeTable)
        .where(
          and(eq(qrCodeTable.id, input.id), eq(qrCodeTable.userId, userId)),
        )

      if (!qrCode) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "QR Code not found",
        })
      }

      // return qrCode.qrData
      return qrCode
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const { id: userId } = ctx.session.user

    const qrCodes = await ctx.db
      .select()
      .from(qrCodeTable)
      .where(eq(qrCodeTable.userId, userId))
      .orderBy(qrCodeTable.createdAt)

    return qrCodes
  }),
})
