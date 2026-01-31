"use client"

import { IconLogin2, IconLogout2 } from "@tabler/icons-react"
import type { Session } from "better-auth"
import Link from "next/link"
import { useRouter } from "next/navigation"
import * as React from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { authClient } from "@/lib/auth/client"

export function QRCodesHeader({ session }: { session: Session | undefined }) {
  const router = useRouter()

  const [_state, formAction, isPending] = React.useActionState(signOut, null)

  function signOut() {
    React.startTransition(async () => {
      await authClient.signOut({
        fetchOptions: {
          onError() {
            toast.error("Failed to log out. Please try again.")
          },
          onSuccess() {
            router.refresh()
          },
        },
      })
    })
  }

  return (
    <div className="mb-8 flex items-center gap-4">
      <Tooltip>
        {session ? (
          <TooltipTrigger
            render={
              <form action={formAction}>
                <Button
                  disabled={isPending}
                  size="icon"
                  type="submit"
                  variant="secondary"
                >
                  {isPending ? <Spinner /> : <IconLogout2 className="size-5" />}
                </Button>
              </form>
            }
          />
        ) : (
          <TooltipTrigger
            render={
              <Button
                disabled={isPending}
                nativeButton={false}
                render={
                  <Link href="/auth">
                    <IconLogin2 className="size-5" />
                  </Link>
                }
                size="icon"
                variant="secondary"
              />
            }
          />
        )}

        <TooltipContent side="left">
          <p>{session ? "Logout" : "Login"}</p>
        </TooltipContent>
      </Tooltip>

      <div>
        <h1 className="font-bold text-2xl text-foreground sm:text-3xl">
          QR Code Manager
        </h1>
        <p className="text-muted-foreground text-sm">
          Generate and manage your QR codes
        </p>
      </div>
    </div>
  )
}
