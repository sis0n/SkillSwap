import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { CustomSelect } from "@/components/ui/custom-select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { PortfolioLinkInput } from "@/lib/api/types"
import { cn } from "@/lib/utils"

const PLATFORMS = [
  { value: "github", label: "GitHub" },
  { value: "gitlab", label: "GitLab" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "behance", label: "Behance" },
  { value: "dribbble", label: "Dribbble" },
  { value: "figma", label: "Figma" },
  { value: "codepen", label: "CodePen" },
  { value: "youtube", label: "YouTube" },
  { value: "medium", label: "Medium" },
  { value: "devto", label: "Dev.to" },
  { value: "website", label: "Website" },
] as const

const platformColors: Record<string, string> = {
  github: "bg-gray-800 text-white dark:bg-gray-700 dark:text-gray-100",
  gitlab: "bg-orange-600 text-white",
  linkedin: "bg-blue-700 text-white",
  behance: "bg-blue-600 text-white",
  dribbble: "bg-pink-500 text-white",
  figma: "bg-purple-600 text-white",
  codepen: "bg-gray-900 text-white dark:bg-gray-800",
  youtube: "bg-red-600 text-white",
  medium: "bg-green-700 text-white",
  devto: "bg-gray-900 text-white dark:bg-gray-800",
  website: "bg-blue-500 text-white",
}

function getPlatformLabel(value: string): string {
  return PLATFORMS.find((p) => p.value === value)?.label ?? value
}

function normalizeUrl(url: string): string {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }
  return `https://${url}`
}

interface PortfolioLinkSectionProps {
  value: PortfolioLinkInput[]
  onChange: (links: PortfolioLinkInput[]) => void
  label?: string
  required?: boolean
}

export function PortfolioLinkSection({ value, onChange, label, required }: PortfolioLinkSectionProps) {
  const [adding, setAdding] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newPlatform, setNewPlatform] = useState("")
  const [newUrl, setNewUrl] = useState("")

  function handleAdd() {
    if (!newPlatform || !newUrl.trim()) return
    onChange([...value, { platform: newPlatform, url: newUrl.trim() }])
    setNewPlatform("")
    setNewUrl("")
    setAdding(false)
  }

  function handleDelete(index: number) {
    onChange(value.filter((_, i) => i !== index))
    if (editingIndex === index) setEditingIndex(null)
  }

  function handleMoveUp(index: number) {
    if (index === 0) return
    const next = [...value]
    ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    onChange(next)
  }

  function handleMoveDown(index: number) {
    if (index === value.length - 1) return
    const next = [...value]
    ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <Label>
        {label ?? "Portfolio Links"}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>

      {value.length === 0 && !adding && (
        <p className="text-sm text-muted-foreground">No portfolio links yet.</p>
      )}

      {value.map((link, i) =>
        editingIndex === i ? (
          <EditRow
            key={i}
            platform={link.platform}
            url={link.url}
            onSave={(platform, url) => {
              const next = [...value]
              next[i] = { platform, url }
              onChange(next)
              setEditingIndex(null)
            }}
            onCancel={() => setEditingIndex(null)}
          />
        ) : (
          <div
            key={i}
            className="flex items-center gap-2 rounded-lg border px-3 py-2"
          >
            <span
              className={cn(
                "inline-flex shrink-0 items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                platformColors[link.platform] ?? "bg-muted text-muted-foreground",
              )}
            >
              {getPlatformLabel(link.platform)}
            </span>

            <a
              href={normalizeUrl(link.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="min-w-0 flex-1 truncate text-sm text-primary hover:underline"
            >
              {link.url}
            </a>

            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={() => handleMoveUp(i)}
                disabled={i === 0}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30"
              >
                <ArrowUp className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleMoveDown(i)}
                disabled={i === value.length - 1}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-30"
              >
                <ArrowDown className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingIndex(i)
                  setAdding(false)
                }}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDelete(i)}
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        ),
      )}

      {adding && (
        <AddRow
          platform={newPlatform}
          url={newUrl}
          onPlatformChange={setNewPlatform}
          onUrlChange={setNewUrl}
          onAdd={handleAdd}
          onCancel={() => {
            setAdding(false)
            setNewPlatform("")
            setNewUrl("")
          }}
        />
      )}

      {!adding && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setAdding(true)
            setEditingIndex(null)
          }}
        >
          <Plus className="mr-1 size-3.5" />
          Add Link
        </Button>
      )}
    </div>
  )
}

function EditRow({
  platform, url, onSave, onCancel,
}: {
  platform: string
  url: string
  onSave: (platform: string, url: string) => void
  onCancel: () => void
}) {
  const [editPlatform, setEditPlatform] = useState(platform)
  const [editUrl, setEditUrl] = useState(url)

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="space-y-1.5">
        <Label className="text-xs">Platform</Label>
        <CustomSelect
          options={[{ value: "", label: "Select platform" }, ...PLATFORMS.map((p) => ({ value: p.value, label: p.label }))]}
          value={editPlatform}
          onChange={setEditPlatform}
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">URL</Label>
        <Input
          placeholder="https://..."
          value={editUrl}
          onChange={(e) => setEditUrl(e.target.value)}
        />
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={() => onSave(editPlatform, editUrl)} disabled={!editPlatform || !editUrl.trim()}>
          Done
        </Button>
        <Button size="sm" variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

function AddRow({
  platform, url, onPlatformChange, onUrlChange, onAdd, onCancel,
}: {
  platform: string
  url: string
  onPlatformChange: (v: string) => void
  onUrlChange: (v: string) => void
  onAdd: () => void
  onCancel: () => void
}) {
  return (
    <div className="flex items-end gap-2 rounded-lg border p-3">
      <div className="flex-1 space-y-1.5">
        <Label className="text-xs">Platform</Label>
        <CustomSelect
          options={[{ value: "", label: "Select" }, ...PLATFORMS.map((p) => ({ value: p.value, label: p.label }))]}
          value={platform}
          onChange={onPlatformChange}
        />
      </div>
      <div className="flex-[2] space-y-1.5">
        <Label className="text-xs">URL</Label>
        <Input
          placeholder="https://..."
          value={url}
          onChange={(e) => onUrlChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && platform && url.trim()) onAdd() }}
        />
      </div>
      <button
        type="button"
        onClick={onAdd}
        disabled={!platform || !url.trim()}
        className="mb-0.5 rounded px-2 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-40"
      >
        Add
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="mb-0.5 rounded px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent"
      >
        Cancel
      </button>
    </div>
  )
}