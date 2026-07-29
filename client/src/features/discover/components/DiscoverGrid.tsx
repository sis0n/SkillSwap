import type { ReactNode } from "react"

interface DiscoverGridProps {
  children: ReactNode
}

export function DiscoverGrid({ children }: DiscoverGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  )
}
