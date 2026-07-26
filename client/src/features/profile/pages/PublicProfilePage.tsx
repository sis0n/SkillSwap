import { ArrowLeft, Calendar, ExternalLink, Globe2, MapPin, MessageSquare } from "lucide-react"
import { Link, useParams } from "react-router-dom"

import { AvailabilityManager } from "@/components/shared/AvailabilityManager"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { usePublicProfile } from "@/features/profile/hooks/useProfile"
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

export default function PublicProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { data: user, isLoading, isError, error, refetch } = usePublicProfile(username ?? "")

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl py-8">
        <SkeletonProfile />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <h2 className="text-2xl font-bold">User not found</h2>
        <p className="mt-2 text-muted-foreground">
          {error instanceof Error ? error.message : "The user you're looking for does not exist."}
        </p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/marketplace">Back to Marketplace</Link>
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
    <div className="mx-auto max-w-4xl py-8">
      <Button variant="ghost" size="sm" className="mb-4" asChild>
        <Link to="/marketplace">
          <ArrowLeft className="mr-2 size-4" />
          Back to Marketplace
        </Link>
      </Button>

      <div className="space-y-6">
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
            <h1 className="text-2xl font-bold">
              {user.first_name} {user.last_name}
            </h1>

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

              <Button className="mt-2 w-full" asChild>
                <Link to="#">
                  <MessageSquare className="mr-2 size-4" />
                  Send Exchange Request
                </Link>
              </Button>
            </CardContent>
          </Card>

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
    </div>
  )
}
