import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { CustomSelect } from "@/components/ui/custom-select"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { experienceLevels } from "@/features/skills/schemas/skillSchemas"
import type { UserSkill } from "@/lib/api/types"

interface EditSkillModalProps {
  open: boolean
  onClose: () => void
  skill: UserSkill | null
  onSubmit: (data: {
    title?: string
    description?: string | null
    experience_level?: "beginner" | "intermediate" | "advanced" | "expert"
    years_of_experience?: number | null
    teaching_style?: string | null
    featured?: boolean | null
  }) => void
  isSaving: boolean
  error: string | null
  fieldErrors: Record<string, string> | null
}

export function EditSkillModal({
  open,
  onClose,
  skill,
  onSubmit,
  isSaving,
  error,
  fieldErrors,
}: EditSkillModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [experienceLevel, setExperienceLevel] = useState<
    "beginner" | "intermediate" | "advanced" | "expert"
  >("beginner")
  const [yearsOfExperience, setYearsOfExperience] = useState("")
  const [teachingStyle, setTeachingStyle] = useState("")
  const [featured, setFeatured] = useState(false)

  useEffect(() => {
    if (skill && open) {
      setTitle(skill.title ?? "")
      setDescription(skill.description ?? "")
      setExperienceLevel(skill.experience_level)
      setYearsOfExperience(
        skill.years_of_experience != null ? String(skill.years_of_experience) : "",
      )
      setTeachingStyle(skill.teaching_style ?? "")
      setFeatured(skill.featured)
    }
  }, [skill, open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!skill) return

    onSubmit({
      title: title || undefined,
      description: description || null,
      experience_level: experienceLevel,
      years_of_experience: yearsOfExperience ? Number(yearsOfExperience) : null,
      teaching_style: teachingStyle || null,
      featured: featured || null,
    })
  }

  function getFieldError(field: string): string | undefined {
    return fieldErrors?.[field]
  }

  if (!skill) return null

  return (
    <Dialog open={open} onClose={onClose} title="Edit Skill">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg border p-3">
          <p className="text-sm font-medium">{skill.skill.name}</p>
          <p className="text-xs text-muted-foreground capitalize">
            {skill.type} &middot; {skill.skill.category?.name}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-title">Title (optional)</Label>
          <Input
            id="edit-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {getFieldError("title") && (
            <p className="text-sm text-destructive">{getFieldError("title")}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-desc">Description (optional)</Label>
          <Textarea
            id="edit-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your proficiency or learning goals"
            rows={3}
          />
          {getFieldError("description") && (
            <p className="text-sm text-destructive">
              {getFieldError("description")}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-exp-level">Experience Level</Label>
          <CustomSelect
            id="edit-exp-level"
            value={experienceLevel}
            onChange={(value) =>
              setExperienceLevel(
                value as "beginner" | "intermediate" | "advanced" | "expert",
              )
            }
            options={experienceLevels.map((level) => ({
              value: level,
              label: level.charAt(0).toUpperCase() + level.slice(1),
            }))}
          />
          {getFieldError("experience_level") && (
            <p className="text-sm text-destructive">
              {getFieldError("experience_level")}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-years">Years of Experience (optional)</Label>
          <Input
            id="edit-years"
            type="number"
            min={0}
            max={60}
            value={yearsOfExperience}
            onChange={(e) => setYearsOfExperience(e.target.value)}
            placeholder="e.g. 5"
          />
          {getFieldError("years_of_experience") && (
            <p className="text-sm text-destructive">
              {getFieldError("years_of_experience")}
            </p>
          )}
        </div>

        {skill.type === "teaching" && (
          <div className="space-y-2">
            <Label htmlFor="edit-style">Teaching Style (optional)</Label>
            <Input
              id="edit-style"
              value={teachingStyle}
              onChange={(e) => setTeachingStyle(e.target.value)}
              placeholder="e.g. Hands-on, project-based"
            />
            {getFieldError("teaching_style") && (
              <p className="text-sm text-destructive">
                {getFieldError("teaching_style")}
              </p>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <input
            id="edit-featured"
            type="checkbox"
            className="size-4 rounded border-input"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          <Label htmlFor="edit-featured" className="cursor-pointer">
            Feature this skill (appears first on profile)
          </Label>
        </div>
        {getFieldError("featured") && (
          <p className="text-sm text-destructive">{getFieldError("featured")}</p>
        )}

        {error && (
          <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
