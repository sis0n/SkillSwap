import { Plus, Trash2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import type { AvailabilityInput, AvailabilitySlot } from "@/lib/api/types"

const DAY_LABELS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

interface AvailabilityManagerProps {
  slots: AvailabilitySlot[]
  loading?: boolean
  saving?: boolean
  onSave: (slots: AvailabilityInput[]) => void
  readOnly?: boolean
}

export function AvailabilityManager({ slots, loading, saving, onSave, readOnly }: AvailabilityManagerProps) {
  const [inputs, setInputs] = useState<AvailabilityInput[]>([])
  const hasChanges = inputs.length > 0

  function addSlot() {
    setInputs([...inputs, { day_of_week: 0, start_time: "09:00:00", end_time: "10:00:00" }])
  }

  function updateSlot(index: number, field: keyof AvailabilityInput, value: number | string) {
    setInputs(inputs.map((slot, i) =>
      i === index ? { ...slot, [field]: value } : slot
    ))
  }

  function removeSlot(index: number) {
    setInputs(inputs.filter((_, i) => i !== index))
  }

  function handleSave() {
    const merged = [...slots.map(s => ({
      day_of_week: s.day_of_week,
      start_time: s.start_time,
      end_time: s.end_time,
    })), ...inputs]
    onSave(merged)
    setInputs([])
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  const displaySlots = [...slots, ...inputs.map((s, i) => ({
    id: -(i + 1),
    day_of_week: s.day_of_week,
    day_label: DAY_LABELS[s.day_of_week],
    start_time: s.start_time,
    end_time: s.end_time,
  }))]

  return (
    <div className="space-y-4">
      {displaySlots.length === 0 && (
        <p className="text-sm text-muted-foreground">No availability set.</p>
      )}

      {displaySlots.length > 0 && (
        <div className="space-y-2">
          {displaySlots.map((slot, index) => {
            const isNew = slot.id < 0
            return (
              <div key={index} className="flex items-center gap-2 rounded-lg border p-3">
                {readOnly || !isNew ? (
                  <>
                    <span className="min-w-24 text-sm font-medium">{slot.day_label}</span>
                    <span className="text-sm text-muted-foreground">
                      {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                    </span>
                  </>
                ) : (
                  <>
                    <select
                      value={slot.day_of_week}
                      onChange={(e) => updateSlot(index, "day_of_week", Number(e.target.value))}
                      className="rounded border border-input bg-transparent px-2 py-1 text-sm"
                    >
                      {DAY_LABELS.map((label, i) => (
                        <option key={i} value={i}>{label}</option>
                      ))}
                    </select>
                    <input
                      type="time"
                      value={slot.start_time.slice(0, 5)}
                      onChange={(e) => updateSlot(index, "start_time", e.target.value + ":00")}
                      className="rounded border border-input bg-transparent px-2 py-1 text-sm"
                    />
                    <span className="text-xs text-muted-foreground">to</span>
                    <input
                      type="time"
                      value={slot.end_time.slice(0, 5)}
                      onChange={(e) => updateSlot(index, "end_time", e.target.value + ":00")}
                      className="rounded border border-input bg-transparent px-2 py-1 text-sm"
                    />
                    {isNew && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSlot(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      )}

      {!readOnly && (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSlot}
            disabled={saving}
          >
            <Plus className="mr-1 size-4" />
            Add Slot
          </Button>

          {hasChanges && (
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Availability"}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
