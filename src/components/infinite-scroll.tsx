import { IconLoader2 } from "@tabler/icons-react"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { useIntersectionObserver } from "@/hooks/use-intersection-observer"

interface InfiniteScrollProps {
  isManual?: boolean
  hasNextPage: boolean
  isFetchingNextPage: boolean
  fetchNextPage: () => void
}

export function InfiniteScroll(props: InfiniteScrollProps) {
  const { targetRef, isIntersecting } = useIntersectionObserver({
    rootMargin: "100px",
    threshold: 0.5,
  })

  const {
    isManual = false,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = props

  useEffect(() => {
    if (isIntersecting && !isManual && hasNextPage && !isFetchingNextPage) {
      fetchNextPage()
    }
  }, [isIntersecting, isManual, hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="h-1" ref={targetRef} />
      {hasNextPage && !isManual ? (
        <div className="flex items-center justify-center">
          <IconLoader2 className="size-7 animate-spin text-muted-foreground" />
        </div>
      ) : hasNextPage && isManual ? (
        <Button
          className="underline underline-offset-4 hover:text-foreground/80"
          disabled={!hasNextPage || isFetchingNextPage}
          onClick={() => fetchNextPage()}
          variant="clear"
        >
          {isFetchingNextPage ? (
            <IconLoader2 className="size-7 animate-spin" />
          ) : (
            "Load More"
          )}
        </Button>
      ) : null}
    </div>
  )
}
