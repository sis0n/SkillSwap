import { LoadingSpinner } from "@/components/ui/loading-spinner"

export function ExchangeRequestLoadingState() {
  return (
    <div className="flex justify-center py-16">
      <LoadingSpinner size="lg" />
    </div>
  )
}
