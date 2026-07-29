import { ExternalLink, MapPin } from "lucide-react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/authStore"
import type { DiscoverUser } from "../types/discover"
import { experienceLevelColors, getDisplayName, getInitials } from "../utils"

interface DiscoverSearchCardProps {
  user: DiscoverUser
  onViewSkills: (user: DiscoverUser) => void
}

export function DiscoverSearchCard({ user, onViewSkills }: DiscoverSearchCardProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const visibleSkills = user.matched_skills.slice(0, 3)
  const remainingCount = user.matched_skills_count - 3

  function handleClick() {
    onViewSkills(user)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onViewSkills(user)
    }
  }

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-lg hover:border-primary/20",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View ${getDisplayName(user)}'s matched skills`}
    >
      <CardHeader className="flex-row items-start gap-3 space-y-0 max-sm:gap-2 max-sm:p-4">
        <div className="shrink-0" aria-hidden="true">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt=""
              className="size-12 rounded-full object-cover max-sm:size-10"
            />
          ) : (
            <div className="flex size-12 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground max-sm:size-10 max-sm:text-xs">
              {getInitials(user.first_name, user.last_name)}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-semibold max-sm:text-xs">
            {getDisplayName(user)}
          </h3>
          <p className="truncate text-xs text-muted-foreground max-sm:text-[11px]">
            @{user.username}
          </p>
          {user.headline && (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground max-sm:text-[11px] max-sm:leading-tight">
              {user.headline}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pt-0 max-sm:space-y-2 max-sm:px-4 max-sm:pb-4">
        {user.location && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground max-sm:text-[11px]">
            <MapPin className="size-3 shrink-0 max-sm:size-2.5" aria-hidden="true" />
            <span className="truncate">{user.location}</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5 max-sm:gap-1">
          {visibleSkills.map((skill) => (
            <Badge
              key={skill.id}
              variant="secondary"
              className={cn("text-xs font-normal max-sm:text-[10px] max-sm:px-1.5 max-sm:py-0.5", experienceLevelColors[skill.experience_level])}
            >
              {skill.name}
            </Badge>
          ))}
          {remainingCount > 0 && (
            <Badge variant="outline" className="text-xs max-sm:text-[10px] max-sm:px-1.5 max-sm:py-0.5">
              +{remainingCount} more
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground max-sm:text-[11px]">
            <span className="font-medium">{user.matched_skills_count}</span>
            <span> matched skill{user.matched_skills_count !== 1 ? "s" : ""}</span>
          </span>

          {isAuthenticated ? (
            <Link
              to={`/users/${user.username}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline max-sm:text-[11px]"
            >
              View Profile
              <ExternalLink className="size-3 max-sm:size-2.5" />
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline max-sm:text-[11px]"
            >
              Login to View Profile
              <ExternalLink className="size-3 max-sm:size-2.5" />
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
