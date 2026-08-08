import { AlertCircle, RefreshCw } from "lucide-react"
import { useMemo, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { ChatWindow } from "../components/ChatWindow"
import { ConversationList } from "../components/ConversationList"
import { MessagesEmptyState } from "../components/MessagesEmptyState"
import { MessagesLoadingState } from "../components/MessagesLoadingState"
import {
  PLACEHOLDER_CONVERSATIONS,
  PLACEHOLDER_CURRENT_USER,
  PLACEHOLDER_MESSAGES_BY_CONVERSATION,
} from "../data/placeholder"
import type { Conversation, Message, MessageUser } from "../types/messaging"

interface MessagesPageProps {
  isLoading?: boolean
  isError?: boolean
  error?: string | null
  onRetry?: () => void
  conversations?: Conversation[]
  messagesByConversation?: Record<number, Message[]>
  currentUser?: MessageUser
}

export default function MessagesPage({
  isLoading = false,
  isError = false,
  error = null,
  onRetry = () => {},
  conversations = PLACEHOLDER_CONVERSATIONS,
  messagesByConversation = PLACEHOLDER_MESSAGES_BY_CONVERSATION,
  currentUser = PLACEHOLDER_CURRENT_USER,
}: MessagesPageProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // UI demonstration only: sent messages are appended to this local component
  // state solely to exercise the ChatInput -> ChatWindow send interaction
  // visually. It does not simulate a backend, does not persist anything, and
  // will be fully replaced by the Stage 3 send mutation (POST messages).
  const [demoSentMessages, setDemoSentMessages] = useState<
    Record<number, Message[]>
  >({})
  const nextDemoMessageId = useRef(0)

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId],
  )

  const threadMessages = useMemo(() => {
    if (selectedId === null) return []
    return [
      ...(messagesByConversation[selectedId] ?? []),
      ...(demoSentMessages[selectedId] ?? []),
    ]
  }, [selectedId, messagesByConversation, demoSentMessages])

  function handleSend(body: string) {
    if (!selectedConversation || !currentUser) return
    const message: Message = {
      id: nextDemoMessageId.current++,
      conversation_id: selectedConversation.id,
      sender_id: currentUser.id,
      sender: currentUser,
      body,
      read_at: null,
      created_at: new Date().toISOString(),
    }
    setDemoSentMessages((prev) => ({
      ...prev,
      [selectedConversation.id]: [
        ...(prev[selectedConversation.id] ?? []),
        message,
      ],
    }))
  }

  if (isLoading) {
    return <MessagesLoadingState />
  }

  if (isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
        <AlertCircle className="size-10 text-destructive" aria-hidden="true" />
        <div>
          <p className="font-medium text-destructive">
            Unable to load your conversations.
          </p>
          {error && (
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          )}
        </div>
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="size-4" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="flex h-full min-w-0 overflow-hidden">
      <div
        className={cn(
          "w-full lg:block lg:w-80 lg:shrink-0 lg:border-r",
          selectedConversation ? "hidden lg:block" : "block",
        )}
      >
        {conversations.length === 0 ? (
          <div className="flex h-full items-center justify-center p-4">
            <MessagesEmptyState />
          </div>
        ) : (
          <ConversationList
            conversations={conversations}
            activeId={selectedId}
            onSelect={(conversation) => setSelectedId(conversation.id)}
          />
        )}
      </div>

      <div
        className={cn(
          "min-w-0 flex-1",
          selectedConversation ? "flex" : "hidden lg:flex",
        )}
      >
        <ChatWindow
          conversation={selectedConversation}
          messages={threadMessages}
          currentUserId={currentUser?.id}
          onSend={handleSend}
          onBack={() => setSelectedId(null)}
        />
      </div>
    </div>
  )
}
