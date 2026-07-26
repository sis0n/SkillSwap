import { ChevronDown, X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguages } from "@/features/profile/hooks/useProfile"
import { cn } from "@/lib/utils"

export interface LanguageEntry {
  code: string
  name: string
  proficiency: "native" | "fluent" | "intermediate" | "beginner"
}

interface LanguageAutocompleteProps {
  value: LanguageEntry[]
  onChange: (languages: LanguageEntry[]) => void
}

const proficiencyOptions = [
  { value: "native", label: "Native" },
  { value: "fluent", label: "Fluent" },
  { value: "intermediate", label: "Intermediate" },
  { value: "beginner", label: "Beginner" },
] as const

function ProficiencyBadge({
  entry,
  onUpdate,
  onRemove,
}: {
  entry: LanguageEntry
  onUpdate: (proficiency: LanguageEntry["proficiency"]) => void
  onRemove: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = proficiencyOptions.find((o) => o.value === entry.proficiency)

  return (
    <Badge variant="secondary" className="gap-2 px-3 py-1.5">
      <span className="text-sm font-medium">{entry.name}</span>

      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          className="flex cursor-pointer items-center gap-0.5 rounded px-1 text-xs text-muted-foreground outline-none hover:text-foreground"
        >
          {selected?.label}
          <ChevronDown className="size-3" />
        </button>

        {open && (
          <div className="absolute right-0 top-full z-50 mt-1 min-w-28 rounded-md border bg-popover py-1 shadow-md">
            {proficiencyOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={cn(
                  "flex w-full items-center px-3 py-1.5 text-left text-xs transition-colors",
                  opt.value === entry.proficiency
                    ? "bg-primary text-primary-foreground"
                    : "text-popover-foreground hover:bg-accent",
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onUpdate(opt.value); setOpen(false) }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 rounded-sm p-0.5 text-muted-foreground hover:bg-accent hover:text-foreground"
      >
        <X className="size-3" />
      </button>
    </Badge>
  )
}

export function LanguageAutocomplete({ value, onChange }: LanguageAutocompleteProps) {
  const { data: allLanguages = [] } = useLanguages()
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const selectedCodes = new Set(value.map((l) => l.code))

  const filtered = allLanguages.filter(
    (lang) =>
      !selectedCodes.has(lang.code) &&
      (lang.name.toLowerCase().includes(query.toLowerCase()) ||
        lang.native_name?.toLowerCase().includes(query.toLowerCase())),
  )

  const debouncedSetOpen = useCallback((v: boolean) => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setOpen(v), 150)
  }, [])

  function selectLanguage(code: string) {
    const lang = allLanguages.find((l) => l.code === code)
    if (!lang || selectedCodes.has(code)) return
    onChange([...value, { code: lang.code, name: lang.name, proficiency: "intermediate" }])
    setQuery("")
    setOpen(false)
    setActiveIndex(-1)
    inputRef.current?.focus()
  }

  function removeLanguage(code: string) {
    onChange(value.filter((l) => l.code !== code))
  }

  function updateProficiency(code: string, proficiency: LanguageEntry["proficiency"]) {
    onChange(value.map((l) => (l.code === code ? { ...l, proficiency } : l)))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setOpen(true)
        setActiveIndex(0)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setActiveIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1))
        break
      case "Enter":
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < filtered.length) {
          selectLanguage(filtered[activeIndex].code)
        }
        break
      case "Escape":
        e.preventDefault()
        setOpen(false)
        setActiveIndex(-1)
        break
    }
  }

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement
      item?.scrollIntoView({ block: "nearest" })
    }
  }, [activeIndex])

  useEffect(() => {
    return () => clearTimeout(debounceRef.current)
  }, [])

  return (
    <div className="space-y-3">
      <Label>Languages</Label>

      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search languages..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
            setActiveIndex(-1)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => debouncedSetOpen(false)}
          onKeyDown={handleKeyDown}
        />

        {open && query && filtered.length > 0 && (
          <div
            ref={listRef}
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-auto rounded-md border bg-popover shadow-md"
          >
            {filtered.map((lang, i) => (
              <button
                key={lang.code}
                type="button"
                className={cn(
                  "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                  i === activeIndex
                    ? "bg-accent text-accent-foreground"
                    : "text-popover-foreground hover:bg-accent",
                )}
                onMouseDown={(e) => {
                  e.preventDefault()
                  selectLanguage(lang.code)
                }}
                onMouseEnter={() => setActiveIndex(i)}
              >
                <span>{lang.name}</span>
                {lang.native_name && lang.native_name !== lang.name && (
                  <span className="text-xs text-muted-foreground">({lang.native_name})</span>
                )}
              </button>
            ))}
          </div>
        )}

        {open && query && filtered.length === 0 && (
          <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border bg-popover px-3 py-2 text-sm text-muted-foreground shadow-md">
            No languages found.
          </div>
        )}
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((entry) => (
            <ProficiencyBadge
              key={entry.code}
              entry={entry}
              onUpdate={(p) => updateProficiency(entry.code, p)}
              onRemove={() => removeLanguage(entry.code)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
