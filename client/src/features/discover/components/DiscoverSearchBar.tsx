import { Search } from "lucide-react"
import { useId } from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DiscoverSearchBarProps {
  value?: string
  onChange?: (value: string) => void
}

export function DiscoverSearchBar({ value = "", onChange }: DiscoverSearchBarProps) {
  const id = useId()

  return (
    <div className="relative">
      <Label htmlFor={id} className="sr-only">
        Search by skill name
      </Label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        id={id}
        type="search"
        placeholder="Search by skill name..."
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="pl-9"
      />
    </div>
  )
}
