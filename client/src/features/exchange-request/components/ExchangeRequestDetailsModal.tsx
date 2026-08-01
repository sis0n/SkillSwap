import { Check, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"

import type {
  ExchangeRequest,
  ExchangeRequestUser,
} from "../types/exchange-request"
import {
  exchangeRequestSkillColors,
  formatRequestDate,
  getDisplayName,
  getInitials,
  getRequestRole,
  getSkillDisplayName,
} from "../utils"
import { ExchangeRequestStatusBadge } from "./ExchangeRequestStatusBadge"

interface ExchangeRequestDetailsModalProps {
  request: ExchangeRequest | null
  currentUserId: number
  onClose: () => void
}

function PartyRow({ label, user }: { label: string; user: ExchangeRequestUser }) {
  return (
    <div className="flex items-center gap-3">
      <div className="shrink-0" aria-hidden="true">
        {user.profile?.avatar_url ? (
          <img
            src={user.profile.avatar_url}
            alt=""
            className="size-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-10 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {getInitials(user.first_name, user.last_name)}
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-semibold">{getDisplayName(user)}</p>
        <p className="truncate text-xs text-muted-foreground">@{user.username}</p>
      </div>
    </div>
  )
}

export function ExchangeRequestDetailsModal({
  request,
  currentUserId,
  onClose,
}: ExchangeRequestDetailsModalProps) {
  if (!request) return null

  const role = getRequestRole(request, currentUserId)
  const canAccept = role === "receiver" && request.status === "pending"
  const canDecline = role === "receiver" && request.status === "pending"
  const canCancel =
    role === "sender" &&
    (request.status === "pending" || request.status === "accepted")

  return (
    <Dialog
      open={request !== null}
      onClose={onClose}
      title="Exchange Request Details"
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <PartyRow label="Sender" user={request.sender} />
          <PartyRow label="Receiver" user={request.receiver} />
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-20 shrink-0 text-xs font-medium text-muted-foreground">
              Teaching
            </span>
            <Badge
              variant="outline"
              className={exchangeRequestSkillColors.teaching}
            >
              {getSkillDisplayName(request.teaching_skill)}
            </Badge>
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
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Message
            </p>
            <p className="mt-1 text-sm">{request.message}</p>
          </div>
        )}

        <div className="flex items-center justify-between border-t pt-3">
          <ExchangeRequestStatusBadge status={request.status} />
          <span className="text-xs text-muted-foreground">
            {formatRequestDate(request.created_at)}
          </span>
        </div>

        {(canAccept || canDecline || canCancel) && (
          <div className="flex flex-wrap gap-2 border-t pt-3">
            {canAccept && (
              <Button size="sm">
                <Check className="size-4" />
                Accept
              </Button>
            )}
            {canDecline && (
              <Button size="sm" variant="outline">
                <X className="size-4" />
                Decline
              </Button>
            )}
            {canCancel && (
              <Button size="sm" variant="outline">
                <X className="size-4" />
                Cancel
              </Button>
            )}
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
