import { headers } from "next/headers"
import { redirect } from "next/navigation"

import { auth } from "@/server/auth"

export default async function QRCodesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) return redirect("/auth")

  return (
    <div>
      <h1>QRCodesPage</h1>

      <p>Welcome, {session.user.name}!</p>
    </div>
  )
}
