import { Handshake } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface ActiveExchangeCardProps {
  count?: number
  loading?: boolean
}

export function ActiveExchangeCard({
  count = 0,
  loading = false,
}: ActiveExchangeCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">Active Exchanges</CardTitle>
        <Handshake className="size-5 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-9 w-16" />
        ) : (
          <p className="text-3xl font-bold">{count}</p>
        )}
        <p className="text-sm text-muted-foreground">
          {count > 0
            ? `${count} active exchange${count === 1 ? "" : "s"}`
            : "No active exchanges yet"}
        </p>
      </CardContent>
    </Card>
  )
}
