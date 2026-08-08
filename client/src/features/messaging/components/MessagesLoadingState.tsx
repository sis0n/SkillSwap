import { Skeleton } from "@/components/ui/skeleton"

function ConversationListSkeleton() {
  return (
    <div className="flex h-full min-w-0 flex-col bg-card">
      <div className="min-h-0 flex-1 overflow-hidden divide-y divide-border">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="size-11 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-1/3" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChatWindowSkeleton() {
  return (
    <div className="flex h-full min-w-0 flex-1 flex-col bg-card">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b px-4">
        <Skeleton className="size-9 shrink-0 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-3 p-4">
        <div className="flex justify-start">
          <Skeleton className="h-9 w-2/3 rounded-2xl rounded-bl-md" />
        </div>
        <div className="flex justify-end">
          <Skeleton className="h-9 w-1/2 rounded-2xl rounded-br-md" />
        </div>
        <div className="flex justify-start">
          <Skeleton className="h-9 w-3/5 rounded-2xl rounded-bl-md" />
        </div>
      </div>

      <div className="shrink-0 border-t p-3">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
    </div>
  )
}

export function MessagesLoadingState() {
  return (
    <div className="flex h-full min-w-0 overflow-hidden">
      <div className="w-full lg:block lg:w-80 lg:shrink-0 lg:border-r">
        <ConversationListSkeleton />
      </div>
      <div className="hidden min-w-0 flex-1 lg:flex">
        <ChatWindowSkeleton />
      </div>
    </div>
  )
}
