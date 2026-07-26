import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
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
    <Dialog open={open} onClose={onClose} title="Edit Profile" className="max-w-lg">
      <div className="flex justify-center pb-4">
        <AvatarUploader
          avatarUrl={user?.profile?.avatar_url ?? null}
          username={user?.username ?? ""}
        />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="headline">Headline</Label>
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
          <Label htmlFor="bio">Bio</Label>
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
          <Label htmlFor="location">Location</Label>
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

        <div className="space-y-2">
          <Label htmlFor="experience_level">Experience Level</Label>
          <CustomSelect
            id="experience_level"
            value={expField.field.value ?? ""}
            onChange={expField.field.onChange}
            onBlur={expField.field.onBlur}
            options={experienceOptions}
          />
          {errors.experience_level && (
            <p className="text-sm text-destructive">{errors.experience_level.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <TimezoneSelect
            value={tzField.field.value ?? ""}
            onChange={tzField.field.onChange}
          />
        </div>

        <LanguageAutocomplete
          value={langField.field.value ?? []}
          onChange={langField.field.onChange}
        />

        <PortfolioLinkSection
          value={portfolioLinksField.field.value ?? []}
          onChange={portfolioLinksField.field.onChange}
        />

        <div className="flex items-center gap-3 pt-2">
          <Button
            type="submit"
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
