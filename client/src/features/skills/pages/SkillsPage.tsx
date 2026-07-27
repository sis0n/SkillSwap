import { Plus } from "lucide-react"
import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomSelect } from "@/components/ui/custom-select"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { AddSkillModal } from "@/features/skills/components/AddSkillModal"
import { DeleteSkillDialog } from "@/features/skills/components/DeleteSkillDialog"
import { EditSkillModal } from "@/features/skills/components/EditSkillModal"
import { SkillCard } from "@/features/skills/components/SkillCard"
import {
  useCreateUserSkill,
  useDeleteUserSkill,
  useMySkills,
  useUpdateUserSkill,
} from "@/features/skills/hooks/useSkills"
import { useSkillCategories } from "@/features/skills/hooks/useSkills"
import type { UserSkill } from "@/lib/api/types"

function SkeletonSkills() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-6 w-24" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-32 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-6 w-24" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-32 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SkillsPage() {
  const [addOpen, setAddOpen] = useState(false)
  const [editSkill, setEditSkill] = useState<UserSkill | null>(null)
  const [deleteSkill, setDeleteSkill] = useState<UserSkill | null>(null)
  const [categoryFilter, setCategoryFilter] = useState("")

  const { data: categories } = useSkillCategories()
  const filterParams = useMemo(
    () => (categoryFilter ? { category_id: Number(categoryFilter) } : undefined),
    [categoryFilter],
  )
  const {
    data: skills,
    isLoading,
    isError,
    error,
    refetch,
  } = useMySkills(filterParams)

  const createMutation = useCreateUserSkill()
  const updateMutation = useUpdateUserSkill()
  const deleteMutation = useDeleteUserSkill()

  const [createErrors, setCreateErrors] = useState<{
    general: string | null
    fields: Record<string, string> | null
  }>({ general: null, fields: null })
  const [updateErrors, setUpdateErrors] = useState<{
    general: string | null
    fields: Record<string, string> | null
  }>({ general: null, fields: null })
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const teachingSkills = skills?.filter((s) => s.type === "teaching") ?? []
  const learningSkills = skills?.filter((s) => s.type === "learning") ?? []

  function handleCreate(data: Parameters<typeof createMutation.mutate>[0]) {
    setCreateErrors({ general: null, fields: null })
    createMutation.mutate(data, {
      onSuccess: (response) => {
        if (response.success) {
          setAddOpen(false)
        }
      },
      onError: (err: unknown) => {
        if (err instanceof Error) {
          setCreateErrors({ general: err.message, fields: null })
        }
      },
    })
  }

  function handleUpdate(
    data: Parameters<typeof updateMutation.mutate>[0]["data"],
  ) {
    if (!editSkill) return
    setUpdateErrors({ general: null, fields: null })
    updateMutation.mutate(
      { id: editSkill.id, data },
      {
        onSuccess: (response) => {
          if (response.success) {
            setEditSkill(null)
          }
        },
        onError: (err: unknown) => {
          if (err instanceof Error) {
            const apiErr = err as Error & { response?: { data?: { errors?: Record<string, string[]> } } }
            const fieldErrors: Record<string, string> = {}
            if (apiErr.response?.data?.errors) {
              for (const [key, msgs] of Object.entries(apiErr.response.data.errors)) {
                fieldErrors[key] = msgs[0]
              }
            }
            setUpdateErrors({
              general: err.message,
              fields: Object.keys(fieldErrors).length > 0 ? fieldErrors : null,
            })
          }
        },
      },
    )
  }

  function handleDelete() {
    if (!deleteSkill) return
    setDeleteError(null)
    deleteMutation.mutate(deleteSkill.id, {
      onSuccess: () => {
        setDeleteSkill(null)
      },
      onError: (err: unknown) => {
        if (err instanceof Error) {
          setDeleteError(err.message)
        }
      },
    })
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl">
        <SkeletonSkills />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive">Unable to load your skills.</p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "An unexpected error occurred."}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">My Skills</h1>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 size-4" />
          Add Skill
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Label htmlFor="filter-category" className="shrink-0 text-sm">
          Filter:
        </Label>
        <CustomSelect
          id="filter-category"
          value={categoryFilter || undefined}
          onChange={(value) => setCategoryFilter(value ?? "")}
          placeholder="All categories"
          options={categories?.map((cat) => ({ value: String(cat.id), label: cat.name })) ?? []}
          className="w-48"
        />
      </div>

      {skills && skills.length === 0 && !categoryFilter && (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <p className="text-lg font-medium">No skills added yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first skill to start finding exchange partners!
            </p>
            <Button className="mt-4" onClick={() => setAddOpen(true)}>
              <Plus className="mr-2 size-4" />
              Add Skill
            </Button>
          </CardContent>
        </Card>
      )}

      {skills && skills.length === 0 && categoryFilter && (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <p className="text-sm text-muted-foreground">
              No skills found in this category.
            </p>
          </CardContent>
        </Card>
      )}

      {teachingSkills.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Teaching{" "}
              <span className="text-sm font-normal text-muted-foreground">
                ({teachingSkills.length})
              </span>
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {teachingSkills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onEdit={setEditSkill}
                onDelete={setDeleteSkill}
              />
            ))}
          </div>
        </section>
      )}

      {learningSkills.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Learning{" "}
              <span className="text-sm font-normal text-muted-foreground">
                ({learningSkills.length})
              </span>
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {learningSkills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onEdit={setEditSkill}
                onDelete={setDeleteSkill}
              />
            ))}
          </div>
        </section>
      )}

      <AddSkillModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleCreate}
        isSaving={createMutation.isPending}
        error={createErrors.general}
        fieldErrors={createErrors.fields}
        categories={categories}
      />

      <EditSkillModal
        open={editSkill !== null}
        onClose={() => setEditSkill(null)}
        skill={editSkill}
        onSubmit={handleUpdate}
        isSaving={updateMutation.isPending}
        error={updateErrors.general}
        fieldErrors={updateErrors.fields}
      />

      <DeleteSkillDialog
        open={deleteSkill !== null}
        onClose={() => setDeleteSkill(null)}
        skill={deleteSkill}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
        error={deleteError}
      />
    </div>
  )
}
