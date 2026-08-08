import { Send } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ChatInputProps {
  onSend?: (body: string) => Promise<boolean> | boolean | void
  placeholder?: string
  disabled?: boolean
}

export function ChatInput({
  onSend,
  placeholder = "Type a message...",
  disabled = false,
}: ChatInputProps) {
  const [value, setValue] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const body = value.trim()
    if (!body) return
    const sent = await onSend?.(body)
    if (sent) setValue("")
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Message"
        autoComplete="off"
        disabled={disabled}
        className="h-10"
      />
      <Button
        type="submit"
        size="icon"
        className="size-10 shrink-0"
        disabled={disabled || !value.trim()}
        aria-label="Send message"
      >
        <Send className="size-4" />
      </Button>
    </form>
  )
}
