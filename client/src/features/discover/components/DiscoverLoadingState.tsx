import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { DiscoverGrid } from "./DiscoverGrid"

function SkeletonCard() {
  return (
    <Card>
      <div className="flex items-start gap-4 p-6">
        <Skeleton className="size-12 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
      <CardContent className="space-y-3 pt-0">
        <Skeleton className="h-3 w-40" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-5 w-14 rounded-md" />
        </div>
        <Skeleton className="h-3 w-28" />
      </CardContent>
    </Card>
  )
}

export function DiscoverLoadingState() {
  return (
    <div role="status" aria-label="Loading results">
      <DiscoverGrid>
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </DiscoverGrid>
    </div>
  )
}
