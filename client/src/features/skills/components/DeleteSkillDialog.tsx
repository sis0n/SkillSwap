import type { UserSkill } from "@/lib/api/types"
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface DeleteSkillDialogProps {
  open: boolean
  onClose: () => void
  skill: UserSkill | null
  onConfirm: () => void
  isDeleting: boolean
  error: string | null
}

export function DeleteSkillDialog({
  open,
  onClose,
  skill,
  onConfirm,
  isDeleting,
  error,
}: DeleteSkillDialogProps) {
  if (!skill) return null

  return (
    <Dialog open={open} onClose={onClose} title="Delete Skill">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <span className="font-medium text-foreground">{skill.title}</span>?
          This action cannot be undone.
        </p>

        {error && (
          <p className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </Dialog>
  )
}
