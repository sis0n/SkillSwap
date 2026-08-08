import { AlertCircle, ArrowLeft, MessageSquareText, RefreshCw, WifiOff } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { getApiErrorMessage, getApiFieldErrors } from "@/lib/utils"

import { useConversation, useMessages, useSendMessage } from "../hooks/useMessaging"
import { sendMessageSchema } from "../schemas/messagingSchemas"
import type { Conversation } from "../types/messaging"
import { getDisplayName, getInitials } from "../utils"
import { ChatInput } from "./ChatInput"
import { MessageBubble } from "./MessageBubble"

interface ChatWindowProps {
  conversation: Conversation | null
  conversationId: number | null
  currentUserId?: number
  onBack?: () => void
}

export function ChatWindow({
  conversation,
  conversationId,
  currentUserId,
  onBack,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevConversationId = useRef<number | null>(null)
  const prevMessageCount = useRef(0)
  const justOpened = useRef(false)
  const openedEmpty = useRef(false)
  const [sendError, setSendError] = useState<string | null>(null)

  const { data: conversationData } = useConversation(conversationId)
  const messagesQuery = useMessages(conversationId)
  const sendMessage = useSendMessage()

  const headerConversation = conversationData ?? conversation
  const messages = messagesQuery.data ?? []
  const isReconnecting =
    (messagesQuery.isRefetchError || messagesQuery.isPaused) && messages.length > 0

  useEffect(() => {
    const el = scrollRef.current
    if (!el || !headerConversation) {
      prevConversationId.current = null
      prevMessageCount.current = 0
      justOpened.current = false
      openedEmpty.current = false
      return
    }

    const isNewConversation = prevConversationId.current !== headerConversation.id

    if (isNewConversation) {
      prevConversationId.current = headerConversation.id
      prevMessageCount.current = messages.length
      openedEmpty.current = messages.length === 0
      justOpened.current = true
      el.scrollTop = el.scrollHeight
      return
    }

    if (justOpened.current) {
      justOpened.current = false
      if (openedEmpty.current && messages.length > 0) {
        el.scrollTop = el.scrollHeight
        prevMessageCount.current = messages.length
        return
      }
    }

    if (messages.length > prevMessageCount.current) {
      const last = messages[messages.length - 1]
      if (last && last.sender_id === currentUserId) {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
      }
    }
    prevMessageCount.current = messages.length
  }, [headerConversation, messages, currentUserId])

  async function handleSend(body: string): Promise<boolean> {
    if (conversationId === null) return false
    setSendError(null)

    const result = sendMessageSchema.safeParse({ body })
    if (!result.success) {
      setSendError(result.error.issues[0]?.message ?? "Invalid message")
      return false
    }

    try {
      await sendMessage.mutateAsync({ conversationId, body: result.data.body })
      return true
    } catch (error) {
      setSendError(getApiFieldErrors(error).body ?? getApiErrorMessage(error))
      return false
    }
  }

  if (!conversationId || !headerConversation) {
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

        {headerConversation.other_user.profile?.avatar_url ? (
          <img
            src={headerConversation.other_user.profile.avatar_url}
            alt=""
            className="size-9 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {getInitials(
              headerConversation.other_user.first_name,
              headerConversation.other_user.last_name,
            )}
          </span>
        )}

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {getDisplayName(headerConversation.other_user)}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            @{headerConversation.other_user.username}
          </p>
        </div>
      </header>

      {isReconnecting && (
        <div className="flex shrink-0 items-center justify-center gap-2 border-b bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
          <WifiOff className="size-3.5" aria-hidden="true" />
          Reconnecting...
        </div>
      )}

      <div
        ref={scrollRef}
        role="log"
        aria-label="Messages"
        className="min-h-0 flex-1 overflow-y-auto p-4"
      >
        {messagesQuery.isPending ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Loading messages...
            </p>
          </div>
        ) : messagesQuery.isError && messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-4 text-center">
            <AlertCircle
              className="size-8 text-destructive"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-destructive">
              Unable to load messages.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => messagesQuery.refetch()}
            >
              <RefreshCw className="size-3.5" />
              Retry
            </Button>
          </div>
        ) : messages.length === 0 ? (
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
        {sendError && (
          <p
            role="alert"
            className="mb-2 text-sm text-destructive"
          >
            {sendError}
          </p>
        )}
        <ChatInput onSend={handleSend} disabled={sendMessage.isPending} />
      </div>
    </div>
  )
}
