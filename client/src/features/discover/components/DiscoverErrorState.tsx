import { AlertCircle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface DiscoverErrorStateProps {
  message?: string
  onRetry?: () => void
}

export function DiscoverErrorState({
  message = "Failed to load discover results. Please try again.",
  onRetry,
}: DiscoverErrorStateProps) {
  return (
    <Card className="py-12">
      <CardContent className="flex flex-col items-center text-center">
        <AlertCircle className="size-10 text-destructive" aria-hidden="true" />
        <h3 className="mt-4 text-lg font-semibold">Something went wrong</h3>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{message}</p>
        <Button variant="outline" className="mt-4" onClick={onRetry}>
          <RefreshCw className="mr-2 size-4" />
          Try Again
        </Button>
      </CardContent>
    </Card>
  )
}
