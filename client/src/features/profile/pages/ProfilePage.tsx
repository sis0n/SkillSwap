import { Calendar, ExternalLink, Globe2, MapPin, Pencil } from "lucide-react"
import { useState } from "react"

import { AvailabilityManager } from "@/components/shared/AvailabilityManager"
import { EditProfileModal } from "@/components/shared/EditProfileModal"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useMyProfile } from "@/features/profile/hooks/useProfile"
import { useAuthStore } from "@/stores/authStore"
import { cn } from "@/lib/utils"

function SkeletonProfile() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 md:flex-row md:items-start">
        <Skeleton className="size-32 rounded-full" />
        <div className="flex-1 space-y-2 text-center md:text-left">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <Card>
        <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    </div>
  )
}

export default function ProfilePage() {
  const [editOpen, setEditOpen] = useState(false)
  const currentUser = useAuthStore((state) => state.user)
  const { data: user, isLoading, isError, error, refetch } = useMyProfile()

  if (isLoading) {
    return <SkeletonProfile />
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive">Failed to load profile.</p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "An unexpected error occurred."}
        </p>
        <Button variant="outline" className="mt-4" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  if (!user) return null

  const { profile, availability } = user
  const joinedDate = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  })

  const experienceColors: Record<string, string> = {
    beginner: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    intermediate: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    advanced: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  }

  const proficiencyColors: Record<string, string> = {
    native: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    fluent: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
    intermediate: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    beginner: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
        <div className="size-32 overflow-hidden rounded-full border-2 border-border">
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={user.username}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-muted text-3xl font-bold text-muted-foreground">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 space-y-2 text-center md:text-left">
          <div className="flex items-center justify-center gap-3 md:justify-start">
            <h1 className="text-2xl font-bold">
              {user.first_name} {user.last_name}
            </h1>
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
              <Pencil className="mr-1 size-4" />
              Edit
            </Button>
            <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
          </div>

          <p className="text-sm text-muted-foreground">@{user.username}</p>

          {profile?.headline && (
            <p className="text-lg font-medium">{profile.headline}</p>
          )}

          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground md:justify-start">
            <Calendar className="size-3" />
            Joined {joinedDate}
          </div>

          {profile?.experience_level && (
            <Badge className={experienceColors[profile.experience_level]}>
              {profile.experience_level}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile?.bio ? (
                <p className="text-sm text-muted-foreground">{profile.bio}</p>
              ) : (
                <p className="text-sm italic text-muted-foreground">No bio yet.</p>
              )}

              {profile?.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-4" />
                  {profile.location}
                </div>
              )}

              {profile?.timezone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe2 className="size-4" />
                  {profile.timezone}
                </div>
              )}

              {user.languages && user.languages.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-sm font-medium">Languages</p>
                  <div className="flex flex-wrap gap-1.5">
                    {user.languages.map((lang) => (
                      <Badge
                        key={lang.code}
                        variant="secondary"
                        className="gap-1.5 px-2.5 py-1"
                      >
                        <span>{lang.name}</span>
                        <span className={cn(
                          "rounded px-1.5 py-0.5 text-[10px] font-medium",
                          proficiencyColors[lang.proficiency],
                        )}>
                          {lang.proficiency}
                        </span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {user.portfolio_links && user.portfolio_links.length > 0 && (
                <div className="space-y-2 pt-2">
                  <p className="text-sm font-medium">Portfolio</p>
                  <div className="flex flex-col gap-2">
                    {[...user.portfolio_links]
                      .sort((a, b) => a.display_order - b.display_order)
                      .map((link) => (
                        <a
                          key={link.id}
                          href={link.url.startsWith("http") ? link.url : `https://${link.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
                          <span className="font-medium capitalize">{link.platform}</span>
                          <span className="truncate text-muted-foreground">{link.url}</span>
                        </a>
                      ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {currentUser && (
            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>Email: {user.email}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <AvailabilityManager
              slots={availability}
              loading={isLoading}
              readOnly
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
