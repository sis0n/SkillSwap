import { useMutation, useQueryClient } from "@tanstack/react-query"
import { CheckCircle2, Info, Loader2 } from "lucide-react"
import { useEffect, useRef } from "react"
import { useController, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import * as profileApi from "@/lib/api/profiles"
import type { UpdateProfileData } from "@/lib/api/types"
import { AvatarUploader } from "@/components/shared/AvatarUploader"
import { LanguageAutocomplete } from "@/components/shared/LanguageAutocomplete"
import { PortfolioLinkSection } from "@/components/shared/PortfolioLinkSection"
import { TimezoneSelect } from "@/components/shared/TimezoneSelect"
import { Button } from "@/components/ui/button"
import { CustomSelect } from "@/components/ui/custom-select"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  profileSchema,
  type ProfileFormData,
} from "@/features/profile/schemas/profileSchemas"
import { useMyProfile } from "@/features/profile/hooks/useProfile"
import { cn } from "@/lib/utils"

interface EditProfileModalProps {
  open: boolean
  onClose: () => void
}

const experienceOptions = [
  { value: "", label: "Select level" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
]

const DISCOVER_POINTS = 9
const DISCOVER_THRESHOLD = 5

function Required() {
  return <span className="ml-0.5 text-destructive">*</span>
}

function SectionHeading({ children }: { children: string }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h3>
  )
}

export function EditProfileModal({ open, onClose }: EditProfileModalProps) {
  const { data: user } = useMyProfile()
  const queryClient = useQueryClient()
  const submitting = useRef(false)

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => profileApi.updateProfile(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["profile", "me"] })
        onClose()
      }
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      headline: "",
      bio: "",
      location: "",
      experience_level: undefined,
      timezone: "",
      languages: [],
      portfolio_links: [],
    },
  })

  useEffect(() => {
    if (user && open) {
      reset({
        headline: user.profile?.headline ?? "",
        bio: user.profile?.bio ?? "",
        location: user.profile?.location ?? "",
        experience_level: (user.profile?.experience_level as ProfileFormData["experience_level"]) ?? undefined,
        timezone: user.profile?.timezone ?? "",
        languages: user.languages?.map((l) => ({
          code: l.code,
          name: l.name,
          proficiency: l.proficiency,
        })) ?? [],
        portfolio_links: user.portfolio_links
          ?.sort((a, b) => a.display_order - b.display_order)
          .map((l) => ({ platform: l.platform, url: l.url })) ?? [],
      })
    }
  }, [user, open, reset])

  const expField = useController({ name: "experience_level", control })
  const tzField = useController({ name: "timezone", control })
  const langField = useController({ name: "languages", control })
  const portfolioLinksField = useController({ name: "portfolio_links", control })

  const discoverPoints = [
    !!user?.profile?.avatar_url,
    !!user?.profile?.headline,
    !!user?.profile?.bio,
    user?.profile?.experience_level === "intermediate" || user?.profile?.experience_level === "advanced",
    !!user?.profile?.location,
    !!user?.profile?.timezone,
    (user?.availability?.length ?? 0) > 0,
    (user?.portfolio_links?.length ?? 0) > 0,
    (user?.languages?.length ?? 0) > 0,
  ]
  const completedPoints = discoverPoints.filter(Boolean).length
  const qualifiesForDiscover = completedPoints >= DISCOVER_THRESHOLD
  const progressWidth = (completedPoints / DISCOVER_POINTS) * 100

  async function onSubmit(data: ProfileFormData) {
    if (submitting.current) return
    submitting.current = true
    const payload: Record<string, unknown> = { ...data }
    if (!payload.timezone) {
      payload.timezone = null
    }
    updateMutation.mutate(payload as UpdateProfileData, {
      onSettled: () => {
        submitting.current = false
      },
    })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Edit Profile"
      className="max-w-lg"
      footer={
        <>
          <Button
            type="submit"
            form="edit-profile-form"
            disabled={!isDirty || updateMutation.isPending}
          >
            {updateMutation.isPending && (
              <Loader2 className="mr-2 size-4 animate-spin" />
            )}
            Save
          </Button>
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
        </>
      }
    >
      <div className="mb-5 space-y-3 rounded-lg border bg-muted/40 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {qualifiesForDiscover ? (
              <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
            ) : (
              <Info className="size-4 shrink-0 text-amber-500" />
            )}
            <p className="text-sm font-medium">
              {qualifiesForDiscover
                ? "Your profile is ready for Discover"
                : "Complete your profile to appear in Discover"}
            </p>
          </div>
          <span className="text-sm font-semibold">
            {completedPoints}/{DISCOVER_POINTS}
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              qualifiesForDiscover ? "bg-emerald-500" : "bg-amber-500",
            )}
            style={{ width: `${progressWidth}%` }}
          />
        </div>

        <p className="text-xs text-muted-foreground">
          Fields marked <span className="text-destructive">*</span> count toward your score.
          Complete at least {DISCOVER_THRESHOLD} of {DISCOVER_POINTS} items (including your
          availability) to appear in the Discover module.
        </p>
      </div>

      <form id="edit-profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-col items-center gap-2">
          <Label>Profile Photo <Required /></Label>
          <AvatarUploader
            avatarUrl={user?.profile?.avatar_url ?? null}
            username={user?.username ?? ""}
          />
        </div>

        <div className="space-y-4 border-t pt-4">
          <SectionHeading>About</SectionHeading>

          <div className="space-y-2">
            <Label htmlFor="headline">Headline <Required /></Label>
            <Input
              id="headline"
              placeholder="e.g. Full-stack developer"
              maxLength={100}
              {...register("headline")}
            />
            {errors.headline && (
              <p className="text-sm text-destructive">{errors.headline.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio <Required /></Label>
            <Textarea
              id="bio"
              placeholder="Tell others about yourself..."
              maxLength={500}
              className="min-h-24"
              {...register("bio")}
            />
            {errors.bio && (
              <p className="text-sm text-destructive">{errors.bio.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location <Required /></Label>
            <Input
              id="location"
              placeholder="City, Country"
              maxLength={100}
              {...register("location")}
            />
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-4 border-t pt-4">
          <SectionHeading>Details</SectionHeading>

          <div className="space-y-2">
            <Label htmlFor="experience_level">Experience Level <Required /></Label>
            <CustomSelect
              id="experience_level"
              value={expField.field.value ?? ""}
              onChange={expField.field.onChange}
              onBlur={expField.field.onBlur}
              options={experienceOptions}
            />
            <p className="text-xs text-muted-foreground">
              Intermediate or advanced counts toward your Discover score.
            </p>
            {errors.experience_level && (
              <p className="text-sm text-destructive">{errors.experience_level.message}</p>
            )}
          </div>

          <TimezoneSelect
            value={tzField.field.value ?? ""}
            onChange={tzField.field.onChange}
            label="Timezone"
            required
          />
        </div>

        <div className="space-y-4 border-t pt-4">
          <SectionHeading>Additional</SectionHeading>

          <LanguageAutocomplete
            value={langField.field.value ?? []}
            onChange={langField.field.onChange}
            required
          />

          <PortfolioLinkSection
            value={portfolioLinksField.field.value ?? []}
            onChange={portfolioLinksField.field.onChange}
            required
          />
        </div>

        {updateMutation.isError && (
          <p className="text-sm text-destructive">
            {updateMutation.error instanceof Error
              ? updateMutation.error.message
              : "Failed to save profile."}
          </p>
        )}
      </form>

    </Dialog>
  )
}
