import { Inbox } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import type { ExchangeRequestTab } from "../types/exchange-request"

interface ExchangeRequestEmptyStateProps {
  variant: ExchangeRequestTab
  onNewRequest?: () => void
}

export function ExchangeRequestEmptyState({
  variant,
  onNewRequest,
}: ExchangeRequestEmptyStateProps) {
  return (
    <Card className="py-12">
      <CardContent className="flex flex-col items-center text-center">
        <Inbox className="size-10 text-muted-foreground" aria-hidden="true" />
        <h3 className="mt-4 text-lg font-semibold">
          No {variant === "received" ? "received" : "sent"} requests
        </h3>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {variant === "received"
            ? "When someone sends you a request, it will appear here."
            : "Requests you have sent will appear here."}
        </p>
        {variant === "received" && onNewRequest && (
          <Button className="mt-4" onClick={onNewRequest}>
            New Request
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
