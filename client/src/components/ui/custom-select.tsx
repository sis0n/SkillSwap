import { ChevronDown } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"

export interface Option {
  value: string
  label: string
}

interface CustomSelectProps {
  id?: string
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  options: Option[]
  placeholder?: string
  className?: string
  disabled?: boolean
  searchable?: boolean
}

export function CustomSelect({
  id,
  value,
  onChange,
  onBlur,
  options,
  placeholder = "Select...",
  className,
  disabled,
  searchable = false,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false)
  const [up, setUp] = useState(false)
  const [query, setQuery] = useState("")
  const ref = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(-1)
  const queryTimeoutRef = useRef<number | undefined>(undefined)

  const selected = options.find((o) => o.value === value)

  function handleSelect(opt: Option) {
    onChange?.(opt.value)
    setOpen(false)
    setQuery("")
    setActiveIndex(-1)
    onBlur?.()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault()
        setOpen(true)
        setQuery("")
      }
      return
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setActiveIndex((prev) => (prev < options.length - 1 ? prev + 1 : 0))
        break
      case "ArrowUp":
        e.preventDefault()
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : options.length - 1))
        break
      case "Enter":
        e.preventDefault()
        if (activeIndex >= 0 && activeIndex < options.length) {
          handleSelect(options[activeIndex])
        }
        break
      case "Escape":
        e.preventDefault()
        setOpen(false)
        setQuery("")
        setActiveIndex(-1)
        break
      case "Backspace":
        if (searchable) {
          e.preventDefault()
          const next = query.slice(0, -1)
          setQuery(next)
          if (next) {
            const idx = options.findIndex((o) =>
              o.label.toLowerCase().includes(next.toLowerCase()),
            )
            setActiveIndex(idx >= 0 ? idx : 0)
          } else {
            setActiveIndex(-1)
          }
        }
        break
      default:
        if (searchable && e.key.length === 1) {
          e.preventDefault()
          const next = query + e.key.toLowerCase()
          setQuery(next)
          const idx = options.findIndex((o) =>
            o.label.toLowerCase().includes(next.toLowerCase()),
          )
          setActiveIndex(idx >= 0 ? idx : 0)
          if (queryTimeoutRef.current) clearTimeout(queryTimeoutRef.current)
          queryTimeoutRef.current = window.setTimeout(() => {
            setQuery("")
            setActiveIndex(-1)
          }, 1000)
        }
        break
    }
  }

  useEffect(() => {
    if (!open && query) {
      setQuery("")
    }
  }, [open, query])

  useEffect(() => {
    if (!open || !ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    const dropdownHeight = Math.min(options.length * 36 + 16, 240)
    setUp(spaceBelow < dropdownHeight)

    ref.current.focus()
  }, [open, options.length])

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current) {
      const item = listRef.current.children[activeIndex] as HTMLElement
      item?.scrollIntoView({ block: "nearest" })
    }
  }, [activeIndex])

  useEffect(() => {
    return () => { if (queryTimeoutRef.current) clearTimeout(queryTimeoutRef.current) }
  }, [])

  return (
    <div
      ref={ref}
      className="relative"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      onBlur={(e) => {
        if (!ref.current?.contains(e.relatedTarget as Node)) {
          setTimeout(() => { setOpen(false); setQuery(""); setActiveIndex(-1) }, 200)
        }
      }}
    >
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          "flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors",
          "hover:bg-accent",
          "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          !selected && "text-muted-foreground",
          className,
        )}
        onClick={() => {
          setOpen(!open)
          if (!open) setQuery("")
        }}
      >
        <span>{selected ? selected.label : placeholder}</span>
        <ChevronDown
          className={cn("size-4 text-muted-foreground transition-transform", open && !up && "rotate-180", open && up && "rotate-0")}
        />
      </button>

      {open && (
        <div
          className={cn(
            "absolute left-0 right-0 z-50 mt-1 rounded-md border bg-popover shadow-md",
            up ? "bottom-full mb-1" : "top-full",
          )}
        >
          <div ref={listRef} className="max-h-60 overflow-y-auto">
            {options.map((opt, i) => (
              <button
                key={opt.value}
                type="button"
                className={cn(
                  "flex w-full items-center px-3 py-2 text-left text-sm transition-colors",
                  opt.value === value
                    ? "bg-primary text-primary-foreground"
                    : i === activeIndex
                      ? "bg-accent text-accent-foreground"
                      : "text-popover-foreground hover:bg-accent",
                )}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(opt)}
                onMouseEnter={() => setActiveIndex(i)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
