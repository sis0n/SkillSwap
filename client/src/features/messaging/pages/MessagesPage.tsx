import { AlertCircle, RefreshCw } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/authStore"

import { ChatWindow } from "../components/ChatWindow"
import { ConversationList } from "../components/ConversationList"
import { MessagesEmptyState } from "../components/MessagesEmptyState"
import { MessagesLoadingState } from "../components/MessagesLoadingState"
import { useConversations } from "../hooks/useMessaging"

export default function MessagesPage() {
  const { data, isLoading, isError, error, refetch } = useConversations()
  const currentUser = useAuthStore((state) => state.user)
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const conversations = data?.conversations ?? []

  const selectedConversation = useMemo(
    () => conversations.find((c) => c.id === selectedId) ?? null,
    [conversations, selectedId],
  )

  if (isLoading) {
    return <MessagesLoadingState />
  }

  if (isError && conversations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-4 text-center">
        <AlertCircle className="size-10 text-destructive" aria-hidden="true" />
        <div>
          <p className="font-medium text-destructive">
            Unable to load your conversations.
          </p>
          {error && (
            <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
          )}
        </div>
        <Button variant="outline" onClick={() => refetch()}>
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
          conversationId={selectedId}
          currentUserId={currentUser?.id}
          onBack={() => setSelectedId(null)}
        />
      </div>
    </div>
  )
}
