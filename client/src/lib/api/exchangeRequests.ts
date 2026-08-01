import type { ApiResponse } from "@/lib/api/types"
import api from "@/lib/axios"
import type {
  ExchangeRequest,
  ExchangeRequestRole,
  ExchangeRequestStatus,
  SendExchangeRequestData,
} from "@/features/exchange-request/types/exchange-request"

export interface ExchangeRequestListParams {
  role?: ExchangeRequestRole
  status?: ExchangeRequestStatus | ""
  page?: number
  per_page?: number
}

export interface ExchangeRequestPaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface ExchangeRequestListData {
  exchange_requests: ExchangeRequest[]
}

export type ExchangeRequestListResponse = ApiResponse<ExchangeRequestListData> & {
  meta?: ExchangeRequestPaginationMeta
}

export interface ExchangeRequestData {
  exchange_request: ExchangeRequest
}

export async function listExchangeRequests(
  params?: ExchangeRequestListParams,
): Promise<ExchangeRequestListResponse> {
  const cleanParams: Record<string, string | number> = {}
  if (params?.role) cleanParams.role = params.role
  if (params?.status) cleanParams.status = params.status
  if (params?.page) cleanParams.page = params.page
  if (params?.per_page) cleanParams.per_page = params.per_page

  const response = await api.get<ExchangeRequestListResponse>(
    "/api/v1/me/exchange-requests",
    { params: cleanParams },
  )
  return response.data
}

export async function getExchangeRequest(
  id: number,
): Promise<ApiResponse<ExchangeRequestData>> {
  const response = await api.get<ApiResponse<ExchangeRequestData>>(
    `/api/v1/me/exchange-requests/${id}`,
  )
  return response.data
}

export async function createExchangeRequest(
  data: SendExchangeRequestData,
): Promise<ApiResponse<ExchangeRequestData>> {
  const response = await api.post<ApiResponse<ExchangeRequestData>>(
    "/api/v1/me/exchange-requests",
    data,
  )
  return response.data
}

export async function updateExchangeRequest(
  id: number,
  data: Omit<SendExchangeRequestData, "receiver_id">,
): Promise<ApiResponse<ExchangeRequestData>> {
  const response = await api.put<ApiResponse<ExchangeRequestData>>(
    `/api/v1/me/exchange-requests/${id}`,
    data,
  )
  return response.data
}

export async function acceptExchangeRequest(
  id: number,
): Promise<ApiResponse<ExchangeRequestData>> {
  const response = await api.put<ApiResponse<ExchangeRequestData>>(
    `/api/v1/me/exchange-requests/${id}/accept`,
  )
  return response.data
}

export async function declineExchangeRequest(
  id: number,
): Promise<ApiResponse<ExchangeRequestData>> {
  const response = await api.put<ApiResponse<ExchangeRequestData>>(
    `/api/v1/me/exchange-requests/${id}/decline`,
  )
  return response.data
}

export async function cancelExchangeRequest(
  id: number,
): Promise<ApiResponse<ExchangeRequestData>> {
  const response = await api.put<ApiResponse<ExchangeRequestData>>(
    `/api/v1/me/exchange-requests/${id}/cancel`,
  )
  return response.data
}
