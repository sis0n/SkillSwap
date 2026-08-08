import type { ApiResponse } from "@/lib/api/types"
import api from "@/lib/axios"
import type {
  Conversation,
  Message,
} from "@/features/messaging/types/messaging"

export interface ConversationListParams {
  page?: number
  per_page?: number
}

export interface ConversationPaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface ConversationListData {
  conversations: Conversation[]
  meta: ConversationPaginationMeta
}

export type ConversationListResponse = ApiResponse<ConversationListData> & {
  meta?: ConversationPaginationMeta
}

export interface ConversationData {
  conversation: Conversation
}

export interface MessageListData {
  messages: Message[]
  meta: ConversationPaginationMeta
}

export type MessageListResponse = ApiResponse<MessageListData> & {
  meta?: ConversationPaginationMeta
}

export interface MessageData {
  message: Message
}

export async function listConversations(
  params?: ConversationListParams,
): Promise<ConversationListResponse> {
  const cleanParams: Record<string, string | number> = {}
  if (params?.page) cleanParams.page = params.page
  if (params?.per_page) cleanParams.per_page = params.per_page

  const response = await api.get<ConversationListResponse>(
    "/api/v1/conversations",
    { params: cleanParams },
  )
  return response.data
}

export async function getConversation(
  id: number,
): Promise<ApiResponse<ConversationData>> {
  const response = await api.get<ApiResponse<ConversationData>>(
    `/api/v1/conversations/${id}`,
  )
  return response.data
}

export async function getMessages(
  conversationId: number,
  params?: ConversationListParams,
): Promise<MessageListResponse> {
  const cleanParams: Record<string, string | number> = {}
  if (params?.page) cleanParams.page = params.page
  if (params?.per_page) cleanParams.per_page = params.per_page

  const response = await api.get<MessageListResponse>(
    `/api/v1/conversations/${conversationId}/messages`,
    { params: cleanParams },
  )
  return response.data
}

export async function sendMessage(
  conversationId: number,
  body: string,
): Promise<ApiResponse<MessageData>> {
  const response = await api.post<ApiResponse<MessageData>>(
    `/api/v1/conversations/${conversationId}/messages`,
    { body },
  )
  return response.data
}
