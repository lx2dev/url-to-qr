import { TRPCError } from "@trpc/server"
import { and, desc, eq, lt, or } from "drizzle-orm"
import QRCode from "qrcode"
import z from "zod"

import { DAILY_ANONYMOUS_QR_CODE_LIMIT } from "@/constants"
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/init"
import { getRedisClient } from "@/server/db/redis"
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

  createAnonymous: publicProcedure
    .input(
      z.object({
        url: z.url(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const ip =
        ctx.headers?.get?.("x-forwarded-for")?.split(",")[0]?.trim() ||
        ctx.headers?.get?.("x-real-ip") ||
        "unknown"
      const today = new Date().toISOString().slice(0, 10)
      const redisKey = `anon_qr_limit:${ip}:${today}`
      const limit = DAILY_ANONYMOUS_QR_CODE_LIMIT

      const redis = getRedisClient()
      const current = await redis.incr(redisKey)

      if (current === 1) {
        const now = new Date()
        const msUntilMidnight =
          new Date(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() + 1,
          ).getTime() - now.getTime()
        await redis.expire(redisKey, Math.ceil(msUntilMidnight / 1000))
      }

      if (current > limit) {
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: "Daily limit reached for anonymous users.",
        })
      }

      const qrData = await QRCode.toDataURL(input.url)

      return {
        qrData,
        url: input.url,
      }
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

      const totalCount = await ctx.db.$count(
        qrCodeTable,
        eq(qrCodeTable.userId, user.id),
      )

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
        totalCount,
      }
    }),
})
