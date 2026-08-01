import { Handshake } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { CustomSelect } from "@/components/ui/custom-select"
import { Dialog } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import {
  PLACEHOLDER_LEARNING_SKILLS,
  PLACEHOLDER_RECEIVER,
  PLACEHOLDER_TEACHING_SKILLS,
} from "../data/placeholder"
import type {
  ExchangeRequestSkill,
  ExchangeRequestUser,
  SendExchangeRequestData,
} from "../types/exchange-request"
import { getDisplayName, getInitials, getSkillDisplayName } from "../utils"

const MAX_MESSAGE_LENGTH = 500

interface SendExchangeRequestModalProps {
  open: boolean
  onClose: () => void
  onSubmit?: (data: SendExchangeRequestData) => void
  isSaving?: boolean
  error?: string | null
  receiver?: ExchangeRequestUser | null
  teachingSkills?: ExchangeRequestSkill[]
  teachingSkillsLoading?: boolean
  learningSkills?: ExchangeRequestSkill[]
}

export function SendExchangeRequestModal({
  open,
  onClose,
  onSubmit,
  isSaving = false,
  error = null,
  receiver = PLACEHOLDER_RECEIVER,
  teachingSkills = PLACEHOLDER_TEACHING_SKILLS,
  teachingSkillsLoading = false,
  learningSkills = PLACEHOLDER_LEARNING_SKILLS,
}: SendExchangeRequestModalProps) {
  const [teachingSkillId, setTeachingSkillId] = useState("")
  const [learningSkillId, setLearningSkillId] = useState("")
  const [isOneWay, setIsOneWay] = useState(false)
  const [message, setMessage] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setTeachingSkillId("")
      setLearningSkillId("")
      setIsOneWay(false)
      setMessage("")
      setFieldErrors({})
    }
  }, [open])

  const teachingOptions = teachingSkills.map((skill) => ({
    value: String(skill.id),
    label: `${getSkillDisplayName(skill)} \u00b7 ${skill.experience_level}`,
  }))

  const learningOptions = learningSkills.map((skill) => ({
    value: String(skill.id),
    label: `${getSkillDisplayName(skill)} \u00b7 ${skill.experience_level}`,
  }))

  const receiverUser = receiver ?? PLACEHOLDER_RECEIVER

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const errors: Record<string, string> = {}
    if (!teachingSkillId) {
      errors.teaching_skill_id = "Please select a skill you can teach."
    }
    if (!isOneWay && !learningSkillId) {
      errors.learning_skill_id = "Please select a skill you would like to learn."
    }
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    onSubmit?.({
      receiver_id: receiverUser.id,
      teaching_skill_id: Number(teachingSkillId),
      learning_skill_id: isOneWay ? null : Number(learningSkillId),
      message: message.trim() || null,
    })
  }

  return (
    <Dialog open={open} onClose={onClose} title="Send Exchange Request">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="shrink-0" aria-hidden="true">
            {receiverUser.profile?.avatar_url ? (
              <img
                src={receiverUser.profile.avatar_url}
                alt=""
                className="size-11 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {getInitials(receiverUser.first_name, receiverUser.last_name)}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {getDisplayName(receiverUser)}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              @{receiverUser.username}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="send-teaching-skill">Skill you can teach</Label>
          {teachingSkillsLoading ? (
            <div className="flex h-9 items-center gap-2 text-sm text-muted-foreground">
              <LoadingSpinner size="sm" />
              Loading your skills...
            </div>
          ) : teachingSkills.length === 0 ? (
            <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
              You need to add a teaching skill first.
            </p>
          ) : (
            <CustomSelect
              id="send-teaching-skill"
              value={teachingSkillId || undefined}
              onChange={(value) => setTeachingSkillId(value ?? "")}
              placeholder="Select a teaching skill"
              options={teachingOptions}
            />
          )}
          {fieldErrors.teaching_skill_id && (
            <p className="text-sm text-destructive">
              {fieldErrors.teaching_skill_id}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            id="send-one-way"
            type="checkbox"
            className="size-4 rounded border-input accent-primary"
            checked={isOneWay}
            onChange={(e) => setIsOneWay(e.target.checked)}
          />
          <Label htmlFor="send-one-way" className="cursor-pointer">
            I&apos;m not looking for anything in return
          </Label>
        </div>

        {!isOneWay && (
          <div className="space-y-2">
            <Label htmlFor="send-learning-skill">Skill you want to learn</Label>
            {learningSkills.length === 0 ? (
              <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
                This user has no learning skills listed.
              </p>
            ) : (
              <CustomSelect
                id="send-learning-skill"
                value={learningSkillId || undefined}
                onChange={(value) => setLearningSkillId(value ?? "")}
                placeholder="Select a learning skill"
                options={learningOptions}
              />
            )}
            {fieldErrors.learning_skill_id && (
              <p className="text-sm text-destructive">
                {fieldErrors.learning_skill_id}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="send-message">Message (optional)</Label>
            <span
              className={cn(
                "text-xs text-muted-foreground",
                message.length >= MAX_MESSAGE_LENGTH &&
                  "font-medium text-destructive",
              )}
            >
              {message.length}/{MAX_MESSAGE_LENGTH}
            </span>
          </div>
          <Textarea
            id="send-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder="Add a short note to start the conversation"
            rows={3}
          />
        </div>

        {error && (
          <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Sending..." : "Send Request"}
            {!isSaving && <Handshake className="size-4" />}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
