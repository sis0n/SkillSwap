import { Handshake, MapPin } from "lucide-react"
import { Link } from "react-router-dom"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/authStore"
import type { DiscoverUser } from "../types/discover"
import { experienceLevelColors, getDisplayName, getInitials } from "../utils"

interface ViewSkillsModalProps {
  user: DiscoverUser | null
  onClose: () => void
}

export function ViewSkillsModal({ user, onClose }: ViewSkillsModalProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!user) return null

  const teaching = user.matched_skills.filter((s) => s.type === "teaching")
  const learning = user.matched_skills.filter((s) => s.type === "learning")

  return (
    <Dialog open={user !== null} onClose={onClose} title={getDisplayName(user)}>
      <div className="space-y-5">
        <div className="flex items-start gap-4">
          <div className="shrink-0" aria-hidden="true">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt=""
                className="size-14 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-14 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                {getInitials(user.first_name, user.last_name)}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-muted-foreground">
              @{user.username}
            </p>
            {user.headline && (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {user.headline}
              </p>
            )}
            {user.location && (
              <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{user.location}</span>
              </div>
            )}
          </div>
        </div>

        {teaching.length > 0 && (
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Teaching ({teaching.length})
            </h4>
            <div className="space-y-1.5">
              {teaching.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <span className="text-sm">{skill.name}</span>
                  <Badge
                    variant="secondary"
                    className={cn("text-xs", experienceLevelColors[skill.experience_level])}
                  >
                    {skill.experience_level}
                  </Badge>
                </div>
              ))}
            </div>
          </section>
        )}

        {learning.length > 0 && (
          <section>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Learning ({learning.length})
            </h4>
            <div className="space-y-1.5">
              {learning.map((skill) => (
                <div
                  key={skill.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <span className="text-sm">{skill.name}</span>
                  <Badge
                    variant="secondary"
                    className={cn("text-xs", experienceLevelColors[skill.experience_level])}
                  >
                    {skill.experience_level}
                  </Badge>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="space-y-3 border-t pt-4">
          <label className="flex items-start gap-3 rounded-lg border border-dashed px-3 py-2 opacity-50">
            <input
              type="checkbox"
              disabled
              className="mt-0.5 size-4 shrink-0 accent-primary"
              aria-label="I'm not looking for anything in return"
            />
            <span className="text-sm text-muted-foreground">
              I&apos;m not looking for anything in return
              <span className="ml-1.5 text-xs italic">(Available in Phase 7)</span>
            </span>
          </label>

          {isAuthenticated ? (
            <Button className="w-full" disabled title="Coming in Phase 7">
              <Handshake className="size-4" />
              Send Exchange Request
            </Button>
          ) : (
            <Button className="w-full" asChild>
              <Link to="/login">
                <Handshake className="size-4" />
                Login to Send Request
              </Link>
            </Button>
          )}
        </div>
      </div>
    </Dialog>
  )
}
