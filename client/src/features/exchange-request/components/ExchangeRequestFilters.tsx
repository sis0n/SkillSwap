import { X } from "lucide-react"
import { useId } from "react"

import { Button } from "@/components/ui/button"
import { CustomSelect, type Option } from "@/components/ui/custom-select"
import { Label } from "@/components/ui/label"

import type { ExchangeRequestStatus } from "../types/exchange-request"
import { exchangeRequestStatusLabels } from "../utils"

const STATUS_OPTIONS: Option[] = [
  { value: "", label: "All statuses" },
  ...(
    Object.entries(exchangeRequestStatusLabels) as [
      ExchangeRequestStatus,
      string,
    ][]
  ).map(([value, label]) => ({ value, label })),
]

interface ExchangeRequestFiltersProps {
  status?: string
  onStatusChange?: (value: string) => void
  activeFilterCount?: number
  onClear?: () => void
}

export function ExchangeRequestFilters({
  status = "",
  onStatusChange,
  activeFilterCount = 0,
  onClear,
}: ExchangeRequestFiltersProps) {
  const statusId = useId()

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[180px] flex-1 sm:max-w-xs">
        <Label htmlFor={statusId} className="mb-1.5 block text-xs font-medium">
          Status
        </Label>
        <CustomSelect
          id={statusId}
          value={status}
          onChange={(value) => onStatusChange?.(value ?? "")}
          placeholder="All statuses"
          options={STATUS_OPTIONS}
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
}
