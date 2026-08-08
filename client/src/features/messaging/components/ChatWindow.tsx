import { ArrowLeft, MessageSquareText } from "lucide-react"
import { useEffect, useRef } from "react"

import type { Conversation, Message } from "../types/messaging"
import { getDisplayName, getInitials } from "../utils"
import { ChatInput } from "./ChatInput"
import { MessageBubble } from "./MessageBubble"

interface ChatWindowProps {
  conversation: Conversation | null
  messages: Message[]
  currentUserId?: number
  onSend?: (body: string) => void
  onBack?: () => void
}

export function ChatWindow({
  conversation,
  messages,
  currentUserId,
  onSend,
  onBack,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevConversationId = useRef<number | null>(null)
  const prevMessageCount = useRef(0)
  const justOpened = useRef(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el || !conversation) {
      prevConversationId.current = null
      prevMessageCount.current = 0
      justOpened.current = false
      return
    }

    const isNewConversation = prevConversationId.current !== conversation.id

    if (isNewConversation) {
      prevConversationId.current = conversation.id
      prevMessageCount.current = messages.length
      justOpened.current = true
      el.scrollTop = el.scrollHeight
      return
    }

    if (justOpened.current) {
      if (messages.length > 0) {
        el.scrollTop = el.scrollHeight
        justOpened.current = false
      }
      prevMessageCount.current = messages.length
      return
    }

    if (messages.length > prevMessageCount.current) {
      const last = messages[messages.length - 1]
      if (last && last.sender_id === currentUserId) {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
      }
    }
    prevMessageCount.current = messages.length
  }, [conversation, messages, currentUserId])

  if (!conversation) {
    return (
      <div className="flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-3 bg-background px-4 text-center">
        <MessageSquareText
          className="size-10 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="text-sm font-medium">Select a conversation</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Choose a conversation from the list to start reading and replying to
          messages.
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-card">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b px-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to conversations"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
          >
            <ArrowLeft className="size-5" />
          </button>
        )}

        {conversation.other_user.profile?.avatar_url ? (
          <img
            src={conversation.other_user.profile.avatar_url}
            alt=""
            className="size-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {getInitials(
              conversation.other_user.first_name,
              conversation.other_user.last_name,
            )}
          </span>
        )}

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {getDisplayName(conversation.other_user)}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            @{conversation.other_user.username}
          </p>
        </div>
      </header>

      <div
        ref={scrollRef}
        role="log"
        aria-label="Messages"
        className="min-h-0 flex-1 overflow-y-auto p-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
            <MessageSquareText
              className="size-10 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-sm font-medium">No messages yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Say hello and kick off your skill exchange.
            </p>
          </div>
        ) : (
          <div className="flex min-h-full flex-col justify-end gap-2">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === currentUserId}
              />
            ))}
          </div>
        )}
      </div>

      <div className="shrink-0 border-t p-3">
        <ChatInput onSend={onSend} />
      </div>
    </div>
  )
}
