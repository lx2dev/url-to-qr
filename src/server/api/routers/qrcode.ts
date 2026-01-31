import { TRPCError } from "@trpc/server"
import { and, desc, eq, lt, or } from "drizzle-orm"
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

  list: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            createdAt: z.date(),
            id: z.uuid(),
          })
          .nullish(),
        limit: z.number().min(1).max(100),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { user } = ctx.session
      const { cursor, limit } = input

      const qrCodes = await ctx.db
        .select()
        .from(qrCodeTable)
        .where(
          and(
            eq(qrCodeTable.userId, user.id),
            cursor
              ? or(
                  lt(qrCodeTable.createdAt, cursor.createdAt),
                  and(
                    eq(qrCodeTable.id, cursor.id),
                    eq(qrCodeTable.createdAt, cursor.createdAt),
                  ),
                )
              : undefined,
          ),
        )
        .orderBy(desc(qrCodeTable.createdAt))
        .limit(limit + 1)

      const hasMore = qrCodes.length > limit
      const items = hasMore ? qrCodes.slice(0, -1) : qrCodes
      const lastItem = items[items.length - 1]
      const nextCursor = hasMore
        ? {
            createdAt: lastItem.createdAt,
            id: lastItem.id,
          }
        : null

      return {
        items,
        nextCursor,
      }
    }),
})
