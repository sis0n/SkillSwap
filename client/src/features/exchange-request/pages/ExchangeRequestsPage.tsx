import { AlertCircle, Plus, RefreshCw } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"

import { ExchangeRequestCard } from "../components/ExchangeRequestCard"
import { ExchangeRequestDetailsModal } from "../components/ExchangeRequestDetailsModal"
import { ExchangeRequestEmptyState } from "../components/ExchangeRequestEmptyState"
import { ExchangeRequestFilters } from "../components/ExchangeRequestFilters"
import { ExchangeRequestLoadingState } from "../components/ExchangeRequestLoadingState"
import { ExchangeRequestTabs } from "../components/ExchangeRequestTabs"
import { SendExchangeRequestModal } from "../components/SendExchangeRequestModal"
import {
  PLACEHOLDER_CURRENT_USER_ID,
  PLACEHOLDER_EXCHANGE_REQUESTS,
} from "../data/placeholder"
import type {
  ExchangeRequest,
  ExchangeRequestTab,
} from "../types/exchange-request"

interface ExchangeRequestsPageProps {
  isLoading?: boolean
  isError?: boolean
  error?: string | null
  onRetry?: () => void
  requests?: ExchangeRequest[]
  currentUserId?: number
}

export default function ExchangeRequestsPage({
  isLoading = false,
  isError = false,
  error = null,
  onRetry = () => {},
  requests = PLACEHOLDER_EXCHANGE_REQUESTS,
  currentUserId = PLACEHOLDER_CURRENT_USER_ID,
}: ExchangeRequestsPageProps) {
  const [activeTab, setActiveTab] = useState<ExchangeRequestTab>("received")
  const [statusFilter, setStatusFilter] = useState("")
  const [detailsRequest, setDetailsRequest] = useState<ExchangeRequest | null>(
    null,
  )
  const [sendOpen, setSendOpen] = useState(false)

  const receivedRequests = useMemo(
    () => requests.filter((request) => request.receiver.id === currentUserId),
    [requests, currentUserId],
  )
  const sentRequests = useMemo(
    () => requests.filter((request) => request.sender.id === currentUserId),
    [requests, currentUserId],
  )
  const pendingCount = useMemo(
    () =>
      receivedRequests.filter((request) => request.status === "pending").length,
    [receivedRequests],
  )

  const activeRequests =
    activeTab === "received" ? receivedRequests : sentRequests
  const filteredRequests = useMemo(
    () =>
      statusFilter
        ? activeRequests.filter((request) => request.status === statusFilter)
        : activeRequests,
    [activeRequests, statusFilter],
  )

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
        <Button onClick={() => setSendOpen(true)}>
          <Plus className="mr-2 size-4" />
          New Request
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
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          )}
          <Button variant="outline" className="mt-4" onClick={onRetry}>
            <RefreshCw className="mr-2 size-4" />
            Retry
          </Button>
        </div>
      ) : (
        <ExchangeRequestTabs
          activeTab={activeTab}
          onChange={setActiveTab}
          pendingCount={pendingCount}
        >
          <ExchangeRequestFilters
            status={statusFilter}
            onStatusChange={setStatusFilter}
            activeFilterCount={activeFilterCount}
            onClear={() => setStatusFilter("")}
          />

          {activeRequests.length === 0 ? (
            <div className="mt-4">
              <ExchangeRequestEmptyState
                variant={activeTab}
                onNewRequest={
                  activeTab === "received" ? () => setSendOpen(true) : undefined
                }
              />
            </div>
          ) : filteredRequests.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No requests match this status filter.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {filteredRequests.map((request) => (
                <ExchangeRequestCard
                  key={request.id}
                  request={request}
                  currentUserId={currentUserId}
                  onViewDetails={setDetailsRequest}
                />
              ))}
            </div>
          )}
        </ExchangeRequestTabs>
      )}

      <ExchangeRequestDetailsModal
        request={detailsRequest}
        currentUserId={currentUserId}
        onClose={() => setDetailsRequest(null)}
      />

      <SendExchangeRequestModal
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        onSubmit={() => setSendOpen(false)}
      />
    </div>
  )
}
