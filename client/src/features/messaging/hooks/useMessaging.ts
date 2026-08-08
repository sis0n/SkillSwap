import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import * as conversationsApi from "@/lib/api/conversations"
import type { ConversationListData } from "@/lib/api/conversations"

const MESSAGES_PER_PAGE = 50

export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const response = await conversationsApi.listConversations()
      if (!response.success) throw new Error(response.message)
      return response.data
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

export function useConversation(id: number | null) {
  return useQuery({
    queryKey: ["conversation", id],
    queryFn: async () => {
      const response = await conversationsApi.getConversation(id as number)
      if (!response.success) throw new Error(response.message)
      return response.data.conversation
    },
    enabled: id !== null && id !== undefined,
    staleTime: 30_000,
  })
}

export function useMessages(conversationId: number | null) {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      const response = await conversationsApi.getMessages(conversationId as number, {
        per_page: MESSAGES_PER_PAGE,
      })
      if (!response.success) throw new Error(response.message)

      const messages = response.data.messages

      const conversationsData = queryClient.getQueryData<ConversationListData>([
        "conversations",
      ])
      const conversation = conversationsData?.conversations.find(
        (item) => item.id === conversationId,
      )
      if (conversation && conversation.unread_count > 0) {
        queryClient.invalidateQueries({ queryKey: ["conversations"] })
      }

      return messages
    },
    enabled: conversationId !== null && conversationId !== undefined,
    staleTime: 0,
    refetchInterval: 5_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ conversationId, body }: { conversationId: number; body: string }) =>
      conversationsApi.sendMessage(conversationId, body),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["conversations"] })
        queryClient.invalidateQueries({ queryKey: ["conversation"] })
        queryClient.invalidateQueries({ queryKey: ["messages"] })
      }
    },
  })
}

export function useUnreadConversationCount(): { data: number } {
  const { data } = useConversations()
  const unreadCount = (data?.conversations ?? []).reduce(
    (total, conversation) => total + conversation.unread_count,
    0,
  )
  return { data: unreadCount }
}
