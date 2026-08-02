import { Check, History, Pencil, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

import type { ExchangeRequest } from "../types/exchange-request"
import {
  exchangeRequestSkillColors,
  formatRequestDate,
  getDisplayName,
  getInitials,
  getOtherParty,
  getRequestRole,
  getSkillDisplayName,
} from "../utils"
import { ExchangeRequestStatusBadge } from "./ExchangeRequestStatusBadge"

interface ExchangeRequestCardProps {
  request: ExchangeRequest
  currentUserId?: number
  isMutating?: boolean
  onViewDetails?: (request: ExchangeRequest) => void
  onViewHistory?: (request: ExchangeRequest) => void
  onEdit?: (request: ExchangeRequest) => void
  onAccept?: (request: ExchangeRequest) => void
  onDecline?: (request: ExchangeRequest) => void
  onCancel?: (request: ExchangeRequest) => void
}

export function ExchangeRequestCard({
  request,
  currentUserId,
  isMutating = false,
  onViewDetails,
  onViewHistory,
  onEdit,
  onAccept,
  onDecline,
  onCancel,
}: ExchangeRequestCardProps) {
  const role = currentUserId ? getRequestRole(request, currentUserId) : null
  const otherParty = currentUserId
    ? getOtherParty(request, currentUserId)
    : request.sender
  const canAccept =
    request.status === "pending" &&
    role != null &&
    (request.reconfirmation_required_by ?? "receiver") === role
  const canDecline =
    request.status === "pending" &&
    role != null &&
    (request.reconfirmation_required_by ?? "receiver") === role
  const canCancel =
    role === "sender" &&
    (request.status === "pending" || request.status === "accepted")
  const canEdit =
    (role === "sender" &&
      (request.status === "pending" || request.status === "accepted")) ||
    (role === "receiver" && request.status === "accepted")

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200",
        "hover:shadow-md",
      )}
      onClick={() => onViewDetails?.(request)}
    >
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            className="flex min-w-0 items-start gap-3 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            onClick={(e) => {
              e.stopPropagation()
              onViewDetails?.(request)
            }}
            aria-label={`View exchange request from ${getDisplayName(otherParty)}`}
          >
            <span className="shrink-0" aria-hidden="true">
              {otherParty.profile?.avatar_url ? (
                <img
                  src={otherParty.profile.avatar_url}
                  alt=""
                  className="size-11 rounded-full object-cover"
                />
              ) : (
                <span className="flex size-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {getInitials(otherParty.first_name, otherParty.last_name)}
                </span>
              )}
            </span>

            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                {getDisplayName(otherParty)}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                @{otherParty.username}
              </span>
            </span>
          </button>

          <div className="flex shrink-0 flex-col items-end gap-1">
            <ExchangeRequestStatusBadge status={request.status} />
            {request.status === "pending" &&
              request.reconfirmation_required_by && (
                <span className="text-xs italic text-muted-foreground">
                  Awaiting {request.reconfirmation_required_by} confirmation
                </span>
              )}
            <span className="text-xs text-muted-foreground">
              {formatRequestDate(request.created_at)}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-xs font-medium text-muted-foreground">
              Teaching
            </span>
            {request.teaching_skill ? (
              <Badge
                variant="outline"
                className={exchangeRequestSkillColors.teaching}
              >
                {getSkillDisplayName(request.teaching_skill)}
              </Badge>
            ) : (
              <span className="text-xs italic text-muted-foreground">
                No teaching skill offered
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-xs font-medium text-muted-foreground">
              Learning
            </span>
            {request.learning_skill ? (
              <Badge
                variant="outline"
                className={exchangeRequestSkillColors.learning}
              >
                {getSkillDisplayName(request.learning_skill)}
              </Badge>
            ) : (
              <span className="text-xs italic text-muted-foreground">
                One-way exchange (no return skill requested)
              </span>
            )}
          </div>
        </div>

        {request.message && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {request.message}
          </p>
        )}

        {(canAccept || canDecline || canCancel || canEdit ||
          (request.history?.length ?? 0) > 0) && (
          <div className="flex flex-wrap gap-2 border-t pt-3">
            {(request.history?.length ?? 0) > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  onViewHistory?.(request)
                }}
              >
                <History className="size-4" />
                Details
              </Button>
            )}
            {canEdit && (
              <Button
                size="sm"
                variant="outline"
                disabled={isMutating}
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit?.(request)
                }}
              >
                <Pencil className="size-4" />
                Edit
              </Button>
            )}
            {canAccept && (
              <Button
                size="sm"
                disabled={isMutating}
                onClick={(e) => {
                  e.stopPropagation()
                  onAccept?.(request)
                }}
              >
                <Check className="size-4" />
                Accept
              </Button>
            )}
            {canDecline && (
              <Button
                size="sm"
                variant="outline"
                disabled={isMutating}
                onClick={(e) => {
                  e.stopPropagation()
                  onDecline?.(request)
                }}
              >
                <X className="size-4" />
                Decline
              </Button>
            )}
            {canCancel && (
              <Button
                size="sm"
                variant="outline"
                disabled={isMutating}
                onClick={(e) => {
                  e.stopPropagation()
                  onCancel?.(request)
                }}
              >
                <X className="size-4" />
                Cancel
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
