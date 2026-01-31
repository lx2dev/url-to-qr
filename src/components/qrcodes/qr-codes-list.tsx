"use client"

import { IconDownload, IconTrash } from "@tabler/icons-react"
import Link from "next/link"
import * as React from "react"
import { Suspense } from "react"
import { toast } from "sonner"

import { InfiniteScroll } from "@/components/infinite-scroll"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { DEFAULT_FETCH_LIMIT } from "@/constants"
import { api } from "@/lib/api/client"
import { formatUrlForDisplay, generateQRFilename } from "@/lib/utils"

export function QRCodesList() {
  return (
    <Suspense fallback={<QRCodesList.Skeleton />}>
      <QRCodeListSuspense />
    </Suspense>
  )
}

function QRCodeListSuspense() {
  const utils = api.useUtils()

  const [downloading, setDownloading] = React.useState<boolean>(false)

  const [qrCodesList, query] = api.qrCode.list.useSuspenseInfiniteQuery(
    { limit: DEFAULT_FETCH_LIMIT },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  )

  const qrCodes = qrCodesList.pages.flatMap((page) => page.items)
  const totalCount = qrCodesList.pages[0]?.totalCount || 0

  const deleteQRCode = api.qrCode.delete.useMutation({
    onError(error) {
      toast.error("Something went wrong.", {
        description: error.message,
      })
    },
    onSuccess() {
      utils.qrCode.list.invalidate()
    },
  })

  async function handleDelete(id: string) {
    await deleteQRCode.mutateAsync({ id })
  }

  function handleDownload(qrData: string, url: string) {
    if (downloading) return

    setDownloading(true)
    try {
      const link = document.createElement("a")
      link.href = qrData
      link.download = generateQRFilename(url)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch {
      toast.error("Failed to download QR code.")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div>
      <h2 className="mb-4 font-semibold text-lg">
        Your QR Codes ({totalCount})
      </h2>

      {qrCodes.length === 0 ? (
        <Card className="border border-dashed bg-transparent p-8 text-center ring-0">
          <p className="text-muted-foreground">
            No QR codes yet. Create your first one above!
          </p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {qrCodes.map((qrCode) => (
              <Card
                className="pt-0 dark:bg-card/50 dark:backdrop-blur"
                key={qrCode.id}
              >
                <picture className="relative flex aspect-square w-full items-center justify-center rounded-lg bg-white">
                  <source srcSet={qrCode.qrData} type="image/png" />
                  <img
                    alt={`QR code for ${qrCode.url}`}
                    className="size-full object-contain"
                    src={qrCode.qrData}
                  />
                </picture>

                <CardContent>
                  <div>
                    <p className="mb-1 text-muted-foreground text-xs">
                      Associated URL
                    </p>
                    <Link
                      className="truncate font-mono text-primary text-sm hover:underline"
                      // @ts-expect-error - typedRoutes
                      href={qrCode.url}
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      {formatUrlForDisplay(qrCode.url)}
                    </Link>
                  </div>
                </CardContent>

                <CardFooter className="gap-2">
                  <Button
                    className="flex-1"
                    disabled={
                      downloading ||
                      (deleteQRCode.isPending &&
                        deleteQRCode.variables?.id === qrCode.id)
                    }
                    onClick={() => handleDownload(qrCode.qrData, qrCode.url)}
                    size="sm"
                    variant="outline"
                  >
                    {downloading ? <Spinner /> : <IconDownload />}
                    Download
                  </Button>
                  <Button
                    className="flex-1"
                    disabled={
                      deleteQRCode.isPending &&
                      deleteQRCode.variables?.id === qrCode.id
                    }
                    onClick={() => handleDelete(qrCode.id)}
                    size="sm"
                    variant="destructive"
                  >
                    {deleteQRCode.isPending &&
                    deleteQRCode.variables?.id === qrCode.id ? (
                      <Spinner />
                    ) : (
                      <IconTrash />
                    )}
                    Delete
                  </Button>
                </CardFooter>

                <p className="w-full text-center text-muted-foreground text-xs">
                  {new Date(qrCode.createdAt).toLocaleDateString()}
                </p>
              </Card>
            ))}
          </div>

          <InfiniteScroll
            fetchNextPage={() => query.fetchNextPage()}
            hasNextPage={Boolean(query.hasNextPage)}
            isFetchingNextPage={query.isFetchingNextPage}
          />
        </>
      )}
    </div>
  )
}

QRCodesList.Skeleton = () => (
  <div>
    <h2 className="mb-4 font-semibold text-lg">Your QR Codes</h2>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card className="pt-0 dark:bg-card/50 dark:backdrop-blur" key={index}>
          <Skeleton className="aspect-square rounded-t-lg rounded-b-none" />

          <CardContent>
            <Skeleton className="mb-1 h-3 w-2/4" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>

          <CardFooter className="gap-2">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 flex-1" />
          </CardFooter>

          <Skeleton className="mx-auto h-4 w-1/4" />
        </Card>
      ))}
    </div>
  </div>
)
