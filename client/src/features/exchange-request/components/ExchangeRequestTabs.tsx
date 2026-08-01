import { useId, type ReactNode } from "react"

import { cn } from "@/lib/utils"

import type { ExchangeRequestTab } from "../types/exchange-request"

interface ExchangeRequestTabsProps {
  activeTab: ExchangeRequestTab
  onChange: (tab: ExchangeRequestTab) => void
  pendingCount?: number
  children?: ReactNode
}

const TAB_DEFS: { key: ExchangeRequestTab; label: string }[] = [
  { key: "received", label: "Received" },
  { key: "sent", label: "Sent" },
]

export function ExchangeRequestTabs({
  activeTab,
  onChange,
  pendingCount = 0,
  children,
}: ExchangeRequestTabsProps) {
  const baseId = useId()
  const receivedPanelId = `${baseId}-received-panel`
  const sentPanelId = `${baseId}-sent-panel`
  const activePanelId =
    activeTab === "received" ? receivedPanelId : sentPanelId

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return
    e.preventDefault()
    const index = TAB_DEFS.findIndex((tab) => tab.key === activeTab)
    const direction = e.key === "ArrowRight" ? 1 : -1
    const next = TAB_DEFS[(index + direction + TAB_DEFS.length) % TAB_DEFS.length]
    onChange(next.key)
    document.getElementById(`${baseId}-${next.key}-tab`)?.focus()
  }

  return (
    <div>
      <div
        role="tablist"
        aria-label="Exchange requests"
        className="flex rounded-lg border bg-muted p-1"
        onKeyDown={handleKeyDown}
      >
        {TAB_DEFS.map((tab) => {
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              id={`${baseId}-${tab.key}-tab`}
              aria-selected={isActive}
              aria-controls={
                tab.key === "received" ? receivedPanelId : sentPanelId
              }
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(tab.key)}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
              {tab.key === "received" && pendingCount > 0 && (
                <span
                  className="flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground"
                  aria-label={`${pendingCount} pending`}
                >
                  {pendingCount}
                </span>
              )}
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        id={activePanelId}
        aria-labelledby={`${baseId}-${activeTab}-tab`}
        className="mt-4"
      >
        {children}
      </div>
    </div>
  )
}
