"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { IconCheck, IconQrcode } from "@tabler/icons-react"
import * as React from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import z from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { api } from "@/lib/api/client"
import { useSession } from "@/lib/auth/client"
import { isValidUrl, normalizeUrl } from "@/lib/utils"

const formSchema = z.object({
  url: z
    .string()
    .min(4)
    .refine((val) => isValidUrl(val), {
      message: "Please enter a valid URL.",
    }),
})

export function CreateQRCodeForm() {
  const utils = api.useUtils()
  const { data: session } = useSession()

  const [open, setOpen] = React.useState<boolean>(false)
  const [anonRes, setAnonRes] = React.useState<null | {
    qrData: string
    url: string
  }>(null)

  const createQRCode = api.qrCode.create.useMutation({
    onError(error) {
      toast.error("Something went wrong.", {
        description: error.message,
      })
    },
    onSuccess() {
      utils.qrCode.list.invalidate()
      form.reset()
    },
  })

  const createAnonymous = api.qrCode.createAnonymous.useMutation({
    onError(error) {
      if (error.data?.code === "TOO_MANY_REQUESTS") {
        setOpen(true)
      } else {
        toast.error("Something went wrong.", {
          description: error.message,
        })
      }
    },
    onSuccess(data: { qrData: string; url: string }) {
      setAnonRes(data)
      form.reset()
    },
  })

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      url: "",
    },
    resolver: zodResolver(formSchema),
  })

  const isLoading =
    createQRCode.isPending ||
    createAnonymous.isPending ||
    form.formState.isSubmitting

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (isLoading) return

    const normalizedUrl = normalizeUrl(data.url)

    if (session?.user) {
      await createQRCode.mutateAsync({ url: normalizedUrl })
    } else {
      setAnonRes(null)
      await createAnonymous.mutateAsync({ url: normalizedUrl })
    }
  }

  return (
    <>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <Controller
          control={form.control}
          name="url"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>URL</FieldLabel>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                autoComplete="off"
                disabled={isLoading}
                id={field.name}
                placeholder="example.com"
              />
              <FieldDescription>
                Enter the URL you want to generate a QR code for.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button disabled={isLoading} type="submit">
          {isLoading ? <Spinner /> : <IconQrcode />}
          Generate QR Code
        </Button>
      </form>

      {anonRes && (
        <div className="mt-6 flex flex-col items-center gap-2">
          <picture>
            <source srcSet={anonRes.qrData} type="image/png" />
            <img
              alt="Generated QR code"
              className="size-48"
              src={anonRes.qrData}
            />
          </picture>
          <p className="break-all text-muted-foreground text-xs">
            {anonRes.url}
          </p>
        </div>
      )}

      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Anonymous Limit Reached</DialogTitle>
            <DialogDescription>
              You have reached the limit for anonymous QR code generation.
              Please sign in to create more.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setOpen(false)} type="button">
              <IconCheck /> I Understand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
