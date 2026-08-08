import { MessageSquareText } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

export function MessagesEmptyState() {
  return (
    <Card className="py-12">
      <CardContent className="flex flex-col items-center text-center">
        <MessageSquareText
          className="size-10 text-muted-foreground"
          aria-hidden="true"
        />
        <h3 className="mt-4 text-lg font-semibold">No conversations yet</h3>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          When you accept an exchange request, a conversation is created here.
        </p>
      </CardContent>
    </Card>
  )
}
