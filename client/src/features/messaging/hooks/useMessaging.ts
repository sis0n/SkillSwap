import { PLACEHOLDER_CONVERSATIONS } from "../data/placeholder"

export function useUnreadConversationCount(): { data: number } {
  const unreadCount = PLACEHOLDER_CONVERSATIONS.reduce(
    (total, conversation) => total + conversation.unread_count,
    0,
  )
  return { data: unreadCount }
}
