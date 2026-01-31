"use client"

import { IconLogout2 } from "@tabler/icons-react"
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

export function QRCodesHeader() {
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
            router.push("/auth")
          },
        },
      })
    })
  }

  return (
    <div className="mb-8 flex items-center gap-4">
      <Tooltip>
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
        <TooltipContent side="left">
          <p>Logout</p>
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
