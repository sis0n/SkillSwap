import { Search } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"

interface DiscoverEmptyStateProps {
  hasFilters?: boolean
}

export function DiscoverEmptyState({ hasFilters = false }: DiscoverEmptyStateProps) {
  return (
    <Card className="py-12">
      <CardContent className="flex flex-col items-center text-center">
        <Search className="size-10 text-muted-foreground" aria-hidden="true" />
        <h3 className="mt-4 text-lg font-semibold">No matches found</h3>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {hasFilters
            ? "Try adjusting your filters or search term to find more people."
            : "No users are available in the discover right now."}
        </p>
        {hasFilters && (
          <p className="mt-1 text-xs text-muted-foreground">
            Clear your filters to browse all users.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
