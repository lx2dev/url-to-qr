import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { CreateQRCodeForm } from "@/components/qrcodes/create-form"
import { QRCodesHeader } from "@/components/qrcodes/header"
import { QRCodesList } from "@/components/qrcodes/qr-codes-list"
import { Card } from "@/components/ui/card"
import { DEFAULT_FETCH_LIMIT } from "@/constants"
import { api, HydrateClient } from "@/lib/api/server"
import { auth } from "@/server/auth"

export default async function QRCodesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) return redirect("/auth")

  void api.qrCode.list.prefetchInfinite({
    limit: DEFAULT_FETCH_LIMIT,
  })

  return (
    <HydrateClient>
      <div className="min-h-screen">
        <div className="container mx-auto max-w-2xl px-4 py-6 sm:py-8">
          <QRCodesHeader />

          <Card className="mb-8 p-6 dark:bg-card/50 dark:backdrop-blur">
            <CreateQRCodeForm />
          </Card>

          <QRCodesList />
        </div>
      </div>
    </HydrateClient>
  )
}
