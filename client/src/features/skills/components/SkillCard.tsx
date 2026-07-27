import { Pencil, Star, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import type { UserSkill } from "@/lib/api/types"

const experienceLevelColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  intermediate: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  advanced: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  expert: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

const typeColors: Record<string, string> = {
  teaching:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-400",
  learning:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400",
}

interface SkillCardProps {
  skill: UserSkill
  onEdit: (skill: UserSkill) => void
  onDelete: (skill: UserSkill) => void
}

export function SkillCard({ skill, onEdit, onDelete }: SkillCardProps) {
  return (
    <Card className={`relative ${skill.featured ? "ring-1 ring-yellow-400/50" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-sm font-semibold">{skill.title || skill.skill.name}</h3>
              <Badge variant="outline" className={typeColors[skill.type]}>
                {skill.type}
              </Badge>
              {skill.featured && (
                <Star className="size-4 shrink-0 fill-yellow-400 text-yellow-400" />
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">
                {skill.skill.name}
              </span>
              <span>&middot;</span>
              <span>{skill.skill.category?.name}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <Badge className={experienceLevelColors[skill.experience_level]}>
                {skill.experience_level}
              </Badge>
              {skill.years_of_experience != null && (
                <span className="text-xs text-muted-foreground">
                  {skill.years_of_experience}y exp
                </span>
              )}
            </div>

            {skill.description && (
              <p className="line-clamp-2 text-xs text-muted-foreground">
                {skill.description}
              </p>
            )}

            {skill.teaching_style && skill.type === "teaching" && (
              <p className="text-xs text-muted-foreground">
                Style: {skill.teaching_style}
              </p>
            )}
          </div>

          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit(skill)}
            >
              <Pencil className="size-4" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete(skill)}
            >
              <Trash2 className="size-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
