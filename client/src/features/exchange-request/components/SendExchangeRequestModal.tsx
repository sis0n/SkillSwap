import { Handshake } from "lucide-react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { CustomSelect } from "@/components/ui/custom-select"
import { Dialog } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Textarea } from "@/components/ui/textarea"
import { getApiErrorMessage } from "@/lib/utils"
import { usePublicProfile } from "@/features/profile/hooks/useProfile"
import { useMySkills } from "@/features/skills/hooks/useSkills"
import { cn } from "@/lib/utils"

import { useCreateExchangeRequest } from "../hooks/useExchangeRequests"
import { sendExchangeRequestSchema } from "../schemas/exchangeRequestSchemas"
import type {
  ExchangeRequestSkill,
  ExchangeRequestUser,
} from "../types/exchange-request"
import { getDisplayName, getInitials, getSkillDisplayName } from "../utils"

const MAX_MESSAGE_LENGTH = 500

interface SendExchangeRequestModalProps {
  open: boolean
  onClose: () => void
  receiver?: ExchangeRequestUser | null
}

export function SendExchangeRequestModal({
  open,
  onClose,
  receiver = null,
}: SendExchangeRequestModalProps) {
  const [teachingSkillId, setTeachingSkillId] = useState("")
  const [learningSkillId, setLearningSkillId] = useState("")
  const [isOneWay, setIsOneWay] = useState(false)
  const [message, setMessage] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const { data: mySkills = [], isLoading: mySkillsLoading } = useMySkills()
  const { data: receiverProfile, isLoading: receiverSkillsLoading } =
    usePublicProfile(receiver?.username ?? "")

  const createMutation = useCreateExchangeRequest()

  const teachingSkills: ExchangeRequestSkill[] = mySkills.filter(
    (skill) => skill.type === "teaching",
  )
  const learningSkills: ExchangeRequestSkill[] =
    receiverProfile?.user_skills?.learning ?? []

  useEffect(() => {
    if (open) {
      setTeachingSkillId("")
      setLearningSkillId("")
      setIsOneWay(false)
      setMessage("")
      setFieldErrors({})
      setFormError(null)
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!receiver) return

    setFormError(null)

    const result = sendExchangeRequestSchema.safeParse({
      receiver_id: receiver.id,
      teaching_skill_id: teachingSkillId ? Number(teachingSkillId) : undefined,
      learning_skill_id: isOneWay
        ? null
        : learningSkillId
          ? Number(learningSkillId)
          : undefined,
      message,
    })

    if (!result.success) {
      const errors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const key = String(issue.path[0])
        if (!errors[key]) errors[key] = issue.message
      }
      setFieldErrors(errors)
      return
    }

    if (!isOneWay && !learningSkillId) {
      setFieldErrors({
        learning_skill_id: "Please select a skill you would like to learn.",
      })
      return
    }

    createMutation.mutate(
      {
        receiver_id: receiver.id,
        teaching_skill_id: result.data.teaching_skill_id,
        learning_skill_id: result.data.learning_skill_id ?? null,
        message: result.data.message ?? null,
      },
      {
        onSuccess: (response) => {
          if (response.success) {
            onClose()
          } else {
            setFormError(response.message)
          }
        },
        onError: (err: unknown) => {
          setFormError(getApiErrorMessage(err))
        },
      },
    )
  }

  return (
    <Dialog open={open} onClose={onClose} title="Send Exchange Request">
      <form onSubmit={handleSubmit} className="space-y-5">
        {receiver && (
          <div className="flex items-center gap-3">
            <div className="shrink-0" aria-hidden="true">
              {receiver.profile?.avatar_url ? (
                <img
                  src={receiver.profile.avatar_url}
                  alt=""
                  className="size-11 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-11 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {getInitials(receiver.first_name, receiver.last_name)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {getDisplayName(receiver)}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                @{receiver.username}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="send-teaching-skill">Skill you can teach</Label>
          {mySkillsLoading ? (
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
            onChange={(e) => {
              setIsOneWay(e.target.checked)
              if (e.target.checked) setFieldErrors((prev) => {
                const { learning_skill_id: _removed, ...rest } = prev
                return rest
              })
            }}
          />
          <Label htmlFor="send-one-way" className="cursor-pointer">
            I&apos;m not looking for anything in return
          </Label>
        </div>

        {!isOneWay && (
          <div className="space-y-2">
            <Label htmlFor="send-learning-skill">Skill you want to learn</Label>
            {receiverSkillsLoading ? (
              <div className="flex h-9 items-center gap-2 text-sm text-muted-foreground">
                <LoadingSpinner size="sm" />
                Loading {receiver?.username || "user"}&apos;s skills...
              </div>
            ) : learningSkills.length === 0 ? (
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

        {formError && (
          <p
            role="alert"
            className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {formError}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Sending..." : "Send Request"}
            {!createMutation.isPending && <Handshake className="size-4" />}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
