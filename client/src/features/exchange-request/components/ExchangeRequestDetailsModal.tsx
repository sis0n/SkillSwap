import { AlertCircle, Check, Pencil, RefreshCw, X } from "lucide-react"
import { useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { getApiErrorMessage } from "@/lib/utils"

import type { ExchangeRequest, ExchangeRequestUser } from "../types/exchange-request"
import {
  useAcceptExchangeRequest,
  useCancelExchangeRequest,
  useDeclineExchangeRequest,
  useExchangeRequest,
} from "../hooks/useExchangeRequests"
import {
  exchangeRequestSkillColors,
  formatRequestDate,
  getDisplayName,
  getInitials,
  getRequestRole,
  getSkillDisplayName,
} from "../utils"
import { ExchangeRequestStatusBadge } from "./ExchangeRequestStatusBadge"
import { SendExchangeRequestModal } from "./SendExchangeRequestModal"

interface ExchangeRequestDetailsModalProps {
  requestId: number | null
  currentUserId?: number
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
  requestId,
  currentUserId,
  onClose,
}: ExchangeRequestDetailsModalProps) {
  const { data: request, isLoading, isError, refetch } = useExchangeRequest(requestId)
  const [actionError, setActionError] = useState<string | null>(null)
  const [editOpen, setEditOpen] = useState(false)

  const acceptMutation = useAcceptExchangeRequest()
  const declineMutation = useDeclineExchangeRequest()
  const cancelMutation = useCancelExchangeRequest()

  const isMutating =
    acceptMutation.isPending || declineMutation.isPending || cancelMutation.isPending

  function runAction(
    target: ExchangeRequest,
    mutate: (id: number) => void,
  ) {
    setActionError(null)
    mutate(target.id)
  }

  const open = requestId !== null

  return (
    <Dialog open={open} onClose={onClose} title="Exchange Request Details">
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : isError || !request ? (
        <div className="flex flex-col items-center py-10 text-center">
          <AlertCircle className="size-10 text-destructive" aria-hidden="true" />
          <p className="mt-3 text-sm text-muted-foreground">
            This exchange request could not be loaded.
          </p>
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            <RefreshCw className="mr-2 size-4" />
            Retry
          </Button>
        </div>
      ) : (
        <>
          <RequestBody
            request={request}
            currentUserId={currentUserId}
            isMutating={isMutating}
            actionError={actionError}
            onClose={onClose}
            onEdit={() => setEditOpen(true)}
            onAccept={(r) =>
              runAction(r, (id) =>
                acceptMutation.mutate(id, {
                  onError: (err) => setActionError(getApiErrorMessage(err)),
                }),
              )
            }
            onDecline={(r) =>
              runAction(r, (id) =>
                declineMutation.mutate(id, {
                  onError: (err) => setActionError(getApiErrorMessage(err)),
                }),
              )
            }
            onCancel={(r) =>
              runAction(r, (id) =>
                cancelMutation.mutate(id, {
                  onError: (err) => setActionError(getApiErrorMessage(err)),
                }),
              )
            }
          />
          <SendExchangeRequestModal
            open={editOpen}
            onClose={() => setEditOpen(false)}
            request={request}
            receiver={request.receiver}
            currentUserId={currentUserId}
          />
        </>
      )}
    </Dialog>
  )
}

interface RequestBodyProps {
  request: ExchangeRequest
  currentUserId?: number
  isMutating: boolean
  actionError: string | null
  onClose: () => void
  onEdit: () => void
  onAccept: (request: ExchangeRequest) => void
  onDecline: (request: ExchangeRequest) => void
  onCancel: (request: ExchangeRequest) => void
}

function RequestBody({
  request,
  currentUserId,
  isMutating,
  actionError,
  onClose,
  onEdit,
  onAccept,
  onDecline,
  onCancel,
}: RequestBodyProps) {
  const role = currentUserId ? getRequestRole(request, currentUserId) : null
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
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <PartyRow label="Learning" user={request.sender} />
        <PartyRow label="Teaching" user={request.receiver} />
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
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Message
          </p>
          <p className="mt-1 text-sm">{request.message}</p>
        </div>
      )}

      <div className="flex items-center justify-between border-t pt-3">
        <ExchangeRequestStatusBadge status={request.status} />
        {request.status === "pending" && request.reconfirmation_required_by && (
          <span className="text-xs italic text-muted-foreground">
            Awaiting {request.reconfirmation_required_by} confirmation
          </span>
        )}
        <span className="text-xs text-muted-foreground">
          {formatRequestDate(request.created_at)}
        </span>
      </div>

      {actionError && (
        <p
          role="alert"
          className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {actionError}
        </p>
      )}

      {(canAccept || canDecline || canCancel || canEdit) && (
        <div className="flex flex-wrap gap-2 border-t pt-3">
          {canEdit && (
            <Button
              size="sm"
              variant="outline"
              disabled={isMutating}
              onClick={onEdit}
            >
              <Pencil className="size-4" />
              Edit
            </Button>
          )}
          {canAccept && (
            <Button
              size="sm"
              disabled={isMutating}
              onClick={() => onAccept(request)}
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
              onClick={() => onDecline(request)}
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
              onClick={() => onCancel(request)}
            >
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
  )
}
