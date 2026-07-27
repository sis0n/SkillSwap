import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { CustomSelect } from "@/components/ui/custom-select"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useSkills } from "@/features/skills/hooks/useSkills"
import { experienceLevels } from "@/features/skills/schemas/skillSchemas"
import type { Skill, SkillCategory } from "@/lib/api/skills"

interface AddSkillModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: {
    skill_id?: number
    skill_name?: string
    category_id?: number
    type: "teaching" | "learning"
    title: string | null
    description: string | null
    experience_level: "beginner" | "intermediate" | "advanced" | "expert"
    years_of_experience: number | null
    teaching_style: string | null
    featured: boolean | null
  }) => void
  isSaving: boolean
  error: string | null
  fieldErrors: Record<string, string> | null
  categories?: SkillCategory[]
}

export function AddSkillModal({
  open,
  onClose,
  onSubmit,
  isSaving,
  error,
  fieldErrors,
  categories,
}: AddSkillModalProps) {
  const [search, setSearch] = useState("")
  const [filterCategoryId, setFilterCategoryId] = useState<string>("")
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null)
  const [customName, setCustomName] = useState<string | null>(null)
  const [customCategoryId, setCustomCategoryId] = useState<string>("")
  const [type, setType] = useState<"teaching" | "learning">("teaching")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [experienceLevel, setExperienceLevel] = useState<
    "beginner" | "intermediate" | "advanced" | "expert"
  >("beginner")
  const [yearsOfExperience, setYearsOfExperience] = useState("")
  const [teachingStyle, setTeachingStyle] = useState("")
  const [featured, setFeatured] = useState(false)

  const searchParams = useMemo(() => {
    const params: { search?: string; category_id?: number } = {}
    if (search) params.search = search
    if (filterCategoryId) params.category_id = Number(filterCategoryId)
    return params
  }, [search, filterCategoryId])

  const { data: skills, isLoading: skillsLoading } = useSkills(
    search || filterCategoryId ? searchParams : undefined,
  )

  useEffect(() => {
    if (open) {
      setSearch("")
      setFilterCategoryId("")
      setSelectedSkill(null)
      setCustomName(null)
      setCustomCategoryId("")
      setType("teaching")
      setTitle("")
      setDescription("")
      setExperienceLevel("beginner")
      setYearsOfExperience("")
      setTeachingStyle("")
      setFeatured(false)
    }
  }, [open])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedSkill && !customName) return

    if (selectedSkill) {
      onSubmit({
        skill_id: selectedSkill.id,
        type,
        title: title || null,
        description: description || null,
        experience_level: experienceLevel,
        years_of_experience: yearsOfExperience ? Number(yearsOfExperience) : null,
        teaching_style: teachingStyle || null,
        featured: featured || null,
      })
    } else if (customName && customCategoryId) {
      onSubmit({
        skill_name: customName,
        category_id: Number(customCategoryId),
        type,
        title: title || null,
        description: description || null,
        experience_level: experienceLevel,
        years_of_experience: yearsOfExperience ? Number(yearsOfExperience) : null,
        teaching_style: teachingStyle || null,
        featured: featured || null,
      })
    }
  }

  function selectSkill(skill: Skill) {
    setSelectedSkill(skill)
    setSearch(skill.name)
    setCustomName(null)
  }

  function startCustomSkill() {
    setSelectedSkill(null)
    setCustomName(search)
    setCustomCategoryId(filterCategoryId || String(categories?.[0]?.id ?? ""))
  }

  function getFieldError(field: string): string | undefined {
    return fieldErrors?.[field]
  }

  const showResults =
    !skillsLoading && skills && skills.length > 0 && !selectedSkill && !customName
  const showNoResults =
    !skillsLoading && search.length > 0 && skills?.length === 0 && !selectedSkill && !customName
  const showPrompt =
    !search && !selectedSkill && !customName

  return (
    <Dialog open={open} onClose={onClose} title="Add Skill">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4 rounded-lg border p-4">
          <div className="space-y-2">
            <Label>Search or create a skill</Label>
            <Input
              placeholder="Search for a skill..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setSelectedSkill(null)
                setCustomName(null)
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <CustomSelect
              value={filterCategoryId || undefined}
              onChange={(value) => {
                setFilterCategoryId(value ?? "")
                setSelectedSkill(null)
                setCustomName(null)
              }}
              placeholder="All categories"
              options={categories?.map((cat) => ({ value: String(cat.id), label: cat.name })) ?? []}
            />
          </div>

          {skillsLoading && (
            <p className="text-sm text-muted-foreground">Loading skills...</p>
          )}

          {showResults && (
            <div className="max-h-40 space-y-1 overflow-y-auto">
              {skills.map((skill) => (
                <button
                  key={skill.id}
                  type="button"
                  className="w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent"
                  onClick={() => selectSkill(skill)}
                >
                  <span className="font-medium">{skill.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {skill.category?.name}
                  </span>
                </button>
              ))}
            </div>
          )}

          {showNoResults && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">No skills found.</p>
              {categories && categories.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={startCustomSkill}
                >
                  Add &ldquo;{search}&rdquo; as a new skill
                </Button>
              )}
            </div>
          )}

          {showPrompt && (
            <p className="text-sm text-muted-foreground">
              Start typing to search for skills, or type a custom skill name.
            </p>
          )}

          {customName && (
            <div className="rounded-md border border-dashed px-3 py-2">
              <p className="text-sm">
                New skill: <span className="font-medium">{customName}</span>
              </p>
              <div className="mt-2 space-y-2">
                <Label htmlFor="custom-category">Category</Label>
                <CustomSelect
                  id="custom-category"
                  value={customCategoryId || undefined}
                  onChange={(value) => setCustomCategoryId(value ?? "")}
                  placeholder="Select a category"
                  options={categories?.map((cat) => ({ value: String(cat.id), label: cat.name })) ?? []}
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="add-type">Type</Label>
          <CustomSelect
            id="add-type"
            value={type}
            onChange={(value) => setType(value as "teaching" | "learning")}
            options={[
              { value: "teaching", label: "Teaching" },
              { value: "learning", label: "Learning" },
            ]}
          />
          {getFieldError("type") && (
            <p className="text-sm text-destructive">{getFieldError("type")}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="add-title">Title (optional)</Label>
          <Input
            id="add-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              selectedSkill?.name ?? customName ?? "Skill title"
            }
          />
          {getFieldError("title") && (
            <p className="text-sm text-destructive">{getFieldError("title")}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="add-desc">Description (optional)</Label>
          <Textarea
            id="add-desc"
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
          <Label htmlFor="add-exp-level">Experience Level</Label>
          <CustomSelect
            id="add-exp-level"
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
          <Label htmlFor="add-years">Years of Experience (optional)</Label>
          <Input
            id="add-years"
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

        {type === "teaching" && (
          <div className="space-y-2">
            <Label htmlFor="add-style">Teaching Style (optional)</Label>
            <Input
              id="add-style"
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
            id="add-featured"
            type="checkbox"
            className="size-4 rounded border-input"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          <Label htmlFor="add-featured" className="cursor-pointer">
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
          <Button
            type="submit"
            disabled={
              isSaving ||
              (!selectedSkill && !(customName && customCategoryId))
            }
          >
            {isSaving ? "Saving..." : "Add Skill"}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
