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
import { useUpdateExchangeRequest } from "../hooks/useExchangeRequests"
import { sendExchangeRequestSchema } from "../schemas/exchangeRequestSchemas"
import type {
  ExchangeRequest,
  ExchangeRequestSkill,
  ExchangeRequestUser,
} from "../types/exchange-request"
import { getDisplayName, getInitials, getSkillDisplayName } from "../utils"

const MAX_MESSAGE_LENGTH = 500

interface SendExchangeRequestModalProps {
  open: boolean
  onClose: () => void
  receiver?: ExchangeRequestUser | null
  preselectedLearningSkillId?: number | null
  request?: ExchangeRequest | null
  currentUserId?: number
}

export function SendExchangeRequestModal({
  open,
  onClose,
  receiver = null,
  preselectedLearningSkillId = null,
  request = null,
  currentUserId,
}: SendExchangeRequestModalProps) {
  const [teachingSkillId, setTeachingSkillId] = useState("")
  const [learningSkillId, setLearningSkillId] = useState("")
  const [offeringSkill, setOfferingSkill] = useState(false)
  const [message, setMessage] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  const { data: mySkills = [], isLoading: mySkillsLoading } = useMySkills(
    undefined,
    open,
  )
  const { data: receiverProfile, isLoading: receiverSkillsLoading } =
    usePublicProfile(open ? (receiver?.username ?? "") : "")
  const { data: senderProfile, isLoading: senderSkillsLoading } =
    usePublicProfile(open ? (request?.sender.username ?? "") : "")

  const createMutation = useCreateExchangeRequest()
  const updateMutation = useUpdateExchangeRequest()

  const isEditing = request !== null
  const editorIsSender = isEditing
    ? currentUserId != null && request?.sender.id === currentUserId
    : true

  const requestAccepted = isEditing && request?.status === "accepted"
  const teachingLocked = Boolean(requestAccepted && editorIsSender)
  const learningLocked = Boolean(requestAccepted && !editorIsSender)

  const teachingSkills: ExchangeRequestSkill[] = mySkills.filter(
    (skill) => skill.type === "teaching",
  )
  const senderTeachingSkills: ExchangeRequestSkill[] =
    senderProfile?.user_skills?.teaching ?? []
  const learningSkills: ExchangeRequestSkill[] =
    receiverProfile?.user_skills?.teaching ?? []

  useEffect(() => {
    if (open) {
      if (isEditing && request) {
        setTeachingSkillId(
          request.teaching_skill ? String(request.teaching_skill.id) : "",
        )
        setLearningSkillId(
          request.learning_skill ? String(request.learning_skill.id) : "",
        )
        setOfferingSkill(request.teaching_skill !== null)
        setMessage(request.message ?? "")
      } else {
        setTeachingSkillId("")
        setLearningSkillId(
          preselectedLearningSkillId ? String(preselectedLearningSkillId) : "",
        )
        setOfferingSkill(false)
        setMessage("")
      }
      setFieldErrors({})
      setFormError(null)
    }
  }, [open, isEditing, request, preselectedLearningSkillId])

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

    setFormError(null)

    const isReceiverEditor = isEditing && !editorIsSender

    const result = sendExchangeRequestSchema.safeParse({
      receiver_id: receiver?.id,
      teaching_skill_id: teachingSkillId ? Number(teachingSkillId) : undefined,
      learning_skill_id: learningSkillId ? Number(learningSkillId) : undefined,
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

    if (isReceiverEditor) {
      if (!learningSkillId && !teachingSkillId) {
        setFieldErrors({
          learning_skill_id:
            "Please select at least one skill for the exchange.",
        })
        return
      }
    } else if (!learningSkillId) {
      setFieldErrors({
        learning_skill_id: "Please select a skill you would like to learn.",
      })
      return
    }

    const teaching_skill_id = teachingLocked
      ? (request?.teaching_skill?.id ?? null)
      : editorIsSender
        ? offeringSkill
          ? (teachingSkillId ? Number(teachingSkillId) : null)
          : null
        : result.data.teaching_skill_id ?? null

    const learning_skill_id = learningLocked
      ? (request?.learning_skill?.id ?? null)
      : (result.data.learning_skill_id ?? null)

    if (isEditing && request) {
      updateMutation.mutate(
        {
          id: request.id,
          data: {
            teaching_skill_id,
            learning_skill_id,
            message: result.data.message ?? null,
          },
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
      return
    }

    createMutation.mutate(
      {
        receiver_id: receiver?.id as number,
        teaching_skill_id,
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

  const isMutating = createMutation.isPending || updateMutation.isPending

  const teachingField =
    editorIsSender && !offeringSkill ? null : editorIsSender ? (
      <div className="space-y-2">
        <Label htmlFor="send-teaching-skill">
          Skill you can teach (optional)
        </Label>
        {mySkillsLoading ? (
          <div className="flex h-9 items-center gap-2 text-sm text-muted-foreground">
            <LoadingSpinner size="sm" />
            Loading your skills...
          </div>
        ) : teachingSkills.length === 0 ? (
          <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
            No teaching skills yet — you can still send the request without
            one, or add one later.
          </p>
        ) : (
          <CustomSelect
            id="send-teaching-skill"
            value={teachingSkillId || undefined}
            onChange={(value) => setTeachingSkillId(value ?? "")}
            placeholder="Select a teaching skill"
            options={teachingOptions}
            disabled={teachingLocked}
          />
        )}
        {fieldErrors.teaching_skill_id && (
          <p className="text-sm text-destructive">
            {fieldErrors.teaching_skill_id}
          </p>
        )}
      </div>
    ) : (
      <div className="space-y-2">
        <Label htmlFor="edit-received-teaching">
          Skill {getDisplayName(request!.sender)} will teach you (optional)
        </Label>
        {senderSkillsLoading ? (
          <div className="flex h-9 items-center gap-2 text-sm text-muted-foreground">
            <LoadingSpinner size="sm" />
            Loading their skills...
          </div>
        ) : senderTeachingSkills.length === 0 ? (
          <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
            They have no teaching skills listed.
          </p>
        ) : (
          <CustomSelect
            id="edit-received-teaching"
            value={teachingSkillId || undefined}
            onChange={(value) => setTeachingSkillId(value ?? "")}
            placeholder="Select a skill to learn"
            options={senderTeachingSkills.map((skill) => ({
              value: String(skill.id),
              label: `${getSkillDisplayName(skill)} \u00b7 ${skill.experience_level}`,
            }))}
          />
        )}
        {fieldErrors.teaching_skill_id && (
          <p className="text-sm text-destructive">
            {fieldErrors.teaching_skill_id}
          </p>
        )}
      </div>
    )

  const learningField = (
    <div className="space-y-2">
      <Label htmlFor="send-learning-skill">
        {editorIsSender
          ? `What would you like to learn from ${receiver ? getDisplayName(receiver) : "them"}?`
          : "Skill you'll teach in return (optional)"}
      </Label>
      {receiverSkillsLoading ? (
        <div className="flex h-9 items-center gap-2 text-sm text-muted-foreground">
          <LoadingSpinner size="sm" />
          Loading skills...
        </div>
      ) : learningSkills.length === 0 ? (
        <p className="rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
          This user has no teaching skills listed.
        </p>
      ) : (
<CustomSelect
            id="send-learning-skill"
            value={learningSkillId || undefined}
            onChange={(value) => setLearningSkillId(value ?? "")}
            placeholder="Select a learning skill"
            disabled={learningLocked}
            options={
            editorIsSender
              ? learningOptions
              : [{ value: "", label: "None" }, ...learningOptions]
          }
        />
      )}
      {fieldErrors.learning_skill_id && (
        <p className="text-sm text-destructive">
          {fieldErrors.learning_skill_id}
        </p>
      )}
    </div>
  )

  const teachingOfferCheckbox = editorIsSender && (
    <div className="flex items-center gap-2">
      <input
        id="send-offer-skill"
        type="checkbox"
        className="size-4 rounded border-input accent-primary"
        checked={offeringSkill}
        disabled={teachingLocked}
        onChange={(e) => {
          setOfferingSkill(e.target.checked)
          if (!e.target.checked) {
            setTeachingSkillId("")
            setFieldErrors((prev) => {
              const { teaching_skill_id: _removed, ...rest } = prev
              return rest
            })
          }
        }}
      />
      <Label htmlFor="send-offer-skill" className="cursor-pointer">
        I&apos;d also like to teach them a skill in return
      </Label>
    </div>
  )

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Exchange Request" : "Send Exchange Request"}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {!isEditing && receiver && (
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

        {editorIsSender ? (
          <>
            {learningField}
            {teachingOfferCheckbox}
            {teachingField}
          </>
        ) : (
          <>
            {learningField}
            {teachingField}
          </>
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
            disabled={isMutating}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isMutating}>
            {isMutating
              ? isEditing
                ? "Saving..."
                : "Sending..."
              : isEditing
                ? "Save Changes"
                : "Send Request"}
            {!isMutating && <Handshake className="size-4" />}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}