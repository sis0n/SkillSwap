import { cn } from "@/lib/utils"

import type { Conversation } from "../types/messaging"
import {
  formatConversationTimestamp,
  getDisplayName,
  getInitials,
} from "../utils"

interface ConversationListProps {
  conversations: Conversation[]
  activeId: number | null
  onSelect: (conversation: Conversation) => void
}

export function ConversationList({
  conversations,
  activeId,
  onSelect,
}: ConversationListProps) {
  return (
    <div className="flex h-full min-w-0 flex-col bg-card">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <ul className="divide-y divide-border">
          {conversations.map((conversation) => {
            const isActive = conversation.id === activeId
            return (
              <li key={conversation.id}>
                <button
                  type="button"
                  onClick={() => onSelect(conversation)}
                  aria-pressed={isActive}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                    isActive && "bg-accent text-accent-foreground",
                  )}
                >
                  {conversation.other_user.profile?.avatar_url ? (
                    <img
                      src={conversation.other_user.profile.avatar_url}
                      alt=""
                      className="size-11 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                      {getInitials(
                        conversation.other_user.first_name,
                        conversation.other_user.last_name,
                      )}
                    </span>
                  )}

                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-semibold">
                        {getDisplayName(conversation.other_user)}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {formatConversationTimestamp(conversation.updated_at)}
                      </span>
                    </span>
                    <span className="mt-0.5 flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "truncate text-sm",
                          conversation.unread_count > 0
                            ? "font-medium text-foreground"
                            : "text-muted-foreground",
                        )}
                      >
                        {conversation.last_message?.body ?? "No messages yet."}
                      </span>
                      {conversation.unread_count > 0 && (
                        <span
                          className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground"
                          aria-label={`${conversation.unread_count} unread messages`}
                        >
                          {conversation.unread_count > 99
                            ? "99+"
                            : conversation.unread_count}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
