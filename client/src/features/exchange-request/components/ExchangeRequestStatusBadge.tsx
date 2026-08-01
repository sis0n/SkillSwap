import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import type { ExchangeRequestStatus } from "../types/exchange-request"
import {
  exchangeRequestStatusColors,
  exchangeRequestStatusLabels,
} from "../utils"

interface ExchangeRequestStatusBadgeProps {
  status: ExchangeRequestStatus
  className?: string
}

export function ExchangeRequestStatusBadge({
  status,
  className,
}: ExchangeRequestStatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(exchangeRequestStatusColors[status], className)}
    >
      {exchangeRequestStatusLabels[status]}
    </Badge>
  )
}
