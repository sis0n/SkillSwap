import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { ApiResponse } from "@/lib/api/types"
import type {
  ExchangeRequestListParams,
} from "@/lib/api/exchangeRequests"
import * as exchangeRequestsApi from "@/lib/api/exchangeRequests"
import type { ExchangeRequest, SendExchangeRequestData } from "../types/exchange-request"

const DASHBOARD_QUERY_KEY = ["dashboard"]

export function useExchangeRequests(params: ExchangeRequestListParams) {
  return useQuery({
    queryKey: ["exchange-requests", params],
    queryFn: async () => {
      const response = await exchangeRequestsApi.listExchangeRequests(params)
      if (!response.success) throw new Error(response.message)
      return response
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

export function usePendingExchangeRequestCount() {
  return useQuery({
    queryKey: ["exchange-requests", "pending-count"],
    queryFn: async () => {
      const response = await exchangeRequestsApi.listExchangeRequests({
        role: "receiver",
        status: "pending",
        per_page: 1,
      })
      if (!response.success) throw new Error(response.message)
      return response.meta?.total ?? 0
    },
    staleTime: 30_000,
  })
}

export function useExchangeRequest(id: number | null) {
  return useQuery({
    queryKey: ["exchange-request", id],
    queryFn: async () => {
      const response = await exchangeRequestsApi.getExchangeRequest(id as number)
      if (!response.success) throw new Error(response.message)
      return response.data.exchange_request
    },
    enabled: id !== null,
    staleTime: 30_000,
  })
}

function invalidateExchangeQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["exchange-requests"] })
  queryClient.invalidateQueries({ queryKey: ["exchange-request"] })
  queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY })
}

type ExchangeRequestMutationResult = ApiResponse<{ exchange_request: ExchangeRequest }>

export function useCreateExchangeRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: SendExchangeRequestData) =>
      exchangeRequestsApi.createExchangeRequest(data),
    onSuccess: (response: ExchangeRequestMutationResult) => {
      if (response.success) {
        invalidateExchangeQueries(queryClient)
      }
    },
  })
}

export function useUpdateExchangeRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number
      data: Omit<SendExchangeRequestData, "receiver_id">
    }) => exchangeRequestsApi.updateExchangeRequest(id, data),
    onSuccess: (response: ExchangeRequestMutationResult) => {
      if (response.success) {
        invalidateExchangeQueries(queryClient)
      }
    },
  })
}

function useTransitionMutation(
  mutationFn: (id: number) => Promise<ExchangeRequestMutationResult>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (response: ExchangeRequestMutationResult) => {
      if (response.success) {
        invalidateExchangeQueries(queryClient)
      }
    },
  })
}

export function useAcceptExchangeRequest() {
  return useTransitionMutation(exchangeRequestsApi.acceptExchangeRequest)
}

export function useDeclineExchangeRequest() {
  return useTransitionMutation(exchangeRequestsApi.declineExchangeRequest)
}

export function useCancelExchangeRequest() {
  return useTransitionMutation(exchangeRequestsApi.cancelExchangeRequest)
}

export function useActiveExchangeCount() {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: async () => {
      const response = await exchangeRequestsApi.listExchangeRequests({
        status: "accepted",
        per_page: 1,
      })
      if (!response.success) throw new Error(response.message)
      return response.meta?.total ?? 0
    },
    staleTime: 30_000,
  })
}
