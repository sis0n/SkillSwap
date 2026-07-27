import { Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import type { UserSkill } from "@/lib/api/types"

const experienceLevelColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  intermediate: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  advanced: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  expert: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

interface SkillsSectionProps {
  skills: UserSkill[]
  type: "teaching" | "learning"
  emptyMessage: string
  isOwnProfile?: boolean
}

export function SkillsSection({
  skills,
  type,
  emptyMessage,
  isOwnProfile = false,
}: SkillsSectionProps) {
  if (skills.length === 0 && !isOwnProfile) return null

  const label = type === "teaching" ? "Teaching" : "Learning"

  return (
    <div className="space-y-2 pt-2">
      <p className="text-sm font-medium">{label} Skills</p>
      {skills.length === 0 ? (
        <p className="text-sm italic text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {skills.map((us) => (
            <div
              key={us.id}
              className="inline-flex items-center gap-1.5 rounded-md border bg-card px-2.5 py-1.5 text-xs"
            >
              {us.featured && (
                <Star className="size-3 fill-yellow-400 text-yellow-400" />
              )}
              <span className="font-medium">{us.title || us.skill.name}</span>
              <span className="text-muted-foreground">&middot;</span>
              <span>{us.skill.name}</span>
              <Badge
                className={`px-1.5 py-0 text-[10px] ${
                  experienceLevelColors[us.experience_level]
                }`}
              >
                {us.experience_level}
              </Badge>
              {us.years_of_experience != null && (
                <span className="text-muted-foreground">
                  {us.years_of_experience}y
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
