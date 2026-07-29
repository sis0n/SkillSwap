import { SlidersHorizontal, X } from "lucide-react"
import { useId, useState } from "react"

import { Button } from "@/components/ui/button"
import { CustomSelect, type Option } from "@/components/ui/custom-select"
import { Label } from "@/components/ui/label"

const TYPES: Option[] = [
  { value: "", label: "All types" },
  { value: "teaching", label: "Teaching" },
  { value: "learning", label: "Learning" },
]

const EXPERIENCE_LEVELS: Option[] = [
  { value: "", label: "Any experience" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
]

interface DiscoverFiltersProps {
  category?: string
  type?: string
  experienceLevel?: string
  categories?: Option[]
  activeFilterCount?: number
  onCategoryChange?: (value: string) => void
  onTypeChange?: (value: string) => void
  onExperienceLevelChange?: (value: string) => void
  onClear?: () => void
}

export function DiscoverFilters({
  category = "",
  type = "",
  experienceLevel = "",
  categories = [],
  activeFilterCount = 0,
  onCategoryChange,
  onTypeChange,
  onExperienceLevelChange,
  onClear,
}: DiscoverFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const categoryId = useId()
  const typeId = useId()
  const experienceId = useId()

  const filterControls = (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[160px] flex-1">
        <Label htmlFor={categoryId} className="mb-1.5 block text-xs font-medium">
          Category
        </Label>
        <CustomSelect
          id={categoryId}
          value={category}
          onChange={(value) => onCategoryChange?.(value)}
          placeholder="All categories"
          options={categories}
        />
      </div>

      <div className="min-w-[140px] flex-1">
        <Label htmlFor={typeId} className="mb-1.5 block text-xs font-medium">
          Type
        </Label>
        <CustomSelect
          id={typeId}
          value={type}
          onChange={(value) => onTypeChange?.(value)}
          placeholder="All types"
          options={TYPES}
        />
      </div>

      <div className="min-w-[160px] flex-1">
        <Label htmlFor={experienceId} className="mb-1.5 block text-xs font-medium">
          Experience Level
        </Label>
        <CustomSelect
          id={experienceId}
          value={experienceLevel}
          onChange={(value) => onExperienceLevelChange?.(value)}
          placeholder="Any experience"
          options={EXPERIENCE_LEVELS}
        />
      </div>

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={onClear} className="shrink-0">
          <X className="mr-1 size-4" />
          Clear ({activeFilterCount})
        </Button>
      )}
    </div>
  )

  return (
    <div role="search" aria-label="Discover filters">
      <div className="hidden lg:block">{filterControls}</div>

      <div className="lg:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-filters-panel"
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="size-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-1 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-medium text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onClear} className="shrink-0">
              <X className="mr-1 size-4" />
              Clear
            </Button>
          )}
        </div>

        <div
          id="mobile-filters-panel"
          role="region"
          aria-label="Filter controls"
          className={`grid transition-all duration-300 ease-in-out ${
            mobileOpen
              ? "mt-4 grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="space-y-3">{filterControls}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
