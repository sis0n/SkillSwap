import { AlertCircle, Compass, RefreshCw } from "lucide-react"
import { useMemo, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { DiscoverPagination } from "@/features/discover/components/DiscoverPagination"
import { getApiErrorMessage } from "@/lib/utils"
import { useAuthStore } from "@/stores/authStore"

import { ExchangeRequestCard } from "../components/ExchangeRequestCard"
import { ExchangeRequestDetailsModal } from "../components/ExchangeRequestDetailsModal"
import { ExchangeRequestEmptyState } from "../components/ExchangeRequestEmptyState"
import { ExchangeRequestFilters } from "../components/ExchangeRequestFilters"
import { ExchangeRequestLoadingState } from "../components/ExchangeRequestLoadingState"
import { ExchangeRequestTabs } from "../components/ExchangeRequestTabs"
import { SendExchangeRequestModal } from "../components/SendExchangeRequestModal"
import {
  useAcceptExchangeRequest,
  useCancelExchangeRequest,
  useDeclineExchangeRequest,
  useExchangeRequests,
  usePendingExchangeRequestCount,
} from "../hooks/useExchangeRequests"
import { exchangeRequestStatuses } from "../schemas/exchangeRequestSchemas"
import type {
  ExchangeRequest,
  ExchangeRequestStatus,
  ExchangeRequestTab,
} from "../types/exchange-request"

const STATUS_VALUES = exchangeRequestStatuses as readonly string[]

function numParam(param: string | null): number | undefined {
  if (param === null) return undefined
  const n = Number(param)
  return Number.isNaN(n) ? undefined : n
}

export default function ExchangeRequestsPage() {
  const currentUserId = useAuthStore((state) => state.user?.id)
  const navigate = useNavigate()
  const [urlSearchParams, setUrlSearchParams] = useSearchParams()
  const [detailsRequestId, setDetailsRequestId] = useState<number | null>(null)
  const [editRequest, setEditRequest] = useState<ExchangeRequest | null>(null)
  const [pendingActionId, setPendingActionId] = useState<number | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const activeTab: ExchangeRequestTab =
    urlSearchParams.get("tab") === "sent" ? "sent" : "received"

  const rawStatus = urlSearchParams.get("status")
  const statusFilter = STATUS_VALUES.includes(rawStatus ?? "")
    ? (rawStatus as ExchangeRequestStatus)
    : ""

  const page = Math.max(1, numParam(urlSearchParams.get("page")) ?? 1)

  const searchParams = useMemo(
    () => ({
      role: activeTab === "received" ? "receiver" as const : "sender" as const,
      status: statusFilter || undefined,
      page,
      per_page: 20,
    }),
    [activeTab, statusFilter, page],
  )

  const { data, isLoading, isError, error, refetch } =
    useExchangeRequests(searchParams)
  const { data: pendingCount = 0 } = usePendingExchangeRequestCount()

  const requests = data?.success ? data.data.exchange_requests : []
  const meta = data?.meta ?? {
    current_page: 1,
    last_page: 1,
    per_page: 20,
    total: 0,
  }

  const acceptMutation = useAcceptExchangeRequest()
  const declineMutation = useDeclineExchangeRequest()
  const cancelMutation = useCancelExchangeRequest()

  function rebuildParams(updates: Record<string, string | null>): URLSearchParams {
    const next = new URLSearchParams(urlSearchParams)
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        next.delete(key)
      } else {
        next.set(key, value)
      }
    }
    return next
  }

  function handleTabChange(tab: ExchangeRequestTab) {
    setUrlSearchParams(
      rebuildParams({ tab: tab === "sent" ? "sent" : null, page: null }),
    )
  }

  function handleStatusChange(value: string) {
    setUrlSearchParams(rebuildParams({ status: value || null, page: null }))
  }

  function handlePageChange(nextPage: number) {
    setUrlSearchParams(
      rebuildParams({ page: nextPage > 1 ? String(nextPage) : null }),
    )
  }

  function runAction(
    request: ExchangeRequest,
    mutate: typeof acceptMutation.mutate,
  ) {
    setActionError(null)
    setPendingActionId(request.id)
    mutate(request.id, {
      onSettled: () => setPendingActionId(null),
      onError: (err: unknown) => setActionError(getApiErrorMessage(err)),
    })
  }

  const activeFilterCount = statusFilter ? 1 : 0

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Exchange Requests
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Propose a skill swap or review requests you have received.
          </p>
        </div>
        <Button asChild>
          <Link to="/discover">
            <Compass className="mr-2 size-4" />
            Find a Partner
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <ExchangeRequestLoadingState />
      ) : isError ? (
        <div className="flex flex-col items-center py-12 text-center">
          <AlertCircle
            className="size-10 text-destructive"
            aria-hidden="true"
          />
          <p className="mt-4 font-medium text-destructive">
            Unable to load exchange requests.
          </p>
          {error && (
            <p className="mt-1 text-sm text-muted-foreground">
              {error instanceof Error ? error.message : error}
            </p>
          )}
          <Button variant="outline" className="mt-4" onClick={() => refetch()}>
            <RefreshCw className="mr-2 size-4" />
            Retry
          </Button>
        </div>
      ) : (
        <ExchangeRequestTabs
          activeTab={activeTab}
          onChange={handleTabChange}
          pendingCount={pendingCount}
        >
          <ExchangeRequestFilters
            status={statusFilter}
            onStatusChange={handleStatusChange}
            activeFilterCount={activeFilterCount}
            onClear={() => handleStatusChange("")}
          />

          {actionError && (
            <div
              role="alert"
              className="mt-3 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {actionError}
            </div>
          )}

          {meta.total === 0 ? (
            <div className="mt-4">
              <ExchangeRequestEmptyState
                variant={activeTab}
                onNewRequest={() => navigate("/discover")}
              />
            </div>
          ) : requests.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No requests match this status filter.
            </p>
          ) : (
            <>
              <div className="mt-4 space-y-4">
                {requests.map((request) => (
                  <ExchangeRequestCard
                    key={request.id}
                    request={request}
                    currentUserId={currentUserId}
                    onViewDetails={(r) => setDetailsRequestId(r.id)}
                    onEdit={(r) => setEditRequest(r)}
                    isMutating={pendingActionId === request.id}
                    onAccept={() =>
                      runAction(request, acceptMutation.mutate.bind(acceptMutation))
                    }
                    onDecline={() =>
                      runAction(request, declineMutation.mutate.bind(declineMutation))
                    }
                    onCancel={() =>
                      runAction(request, cancelMutation.mutate.bind(cancelMutation))
                    }
                  />
                ))}
              </div>

              {meta.last_page > 1 && (
                <div className="mt-6">
                  <DiscoverPagination
                    currentPage={meta.current_page}
                    totalPages={meta.last_page}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </ExchangeRequestTabs>
      )}

      <ExchangeRequestDetailsModal
        requestId={detailsRequestId}
        currentUserId={currentUserId}
        onClose={() => setDetailsRequestId(null)}
      />

      <SendExchangeRequestModal
        open={editRequest !== null}
        onClose={() => setEditRequest(null)}
        request={editRequest}
        receiver={editRequest?.receiver}
        currentUserId={currentUserId}
      />
    </div>
  )
}
