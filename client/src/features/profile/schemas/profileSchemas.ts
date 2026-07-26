import { z } from "zod"

const proficiencyValues = ["native", "fluent", "intermediate", "beginner"] as const

export const languageEntrySchema = z.object({
  code: z.string().min(1, "Language is required"),
  name: z.string(),
  proficiency: z.enum(proficiencyValues),
})

export const portfolioLinkEntrySchema = z.object({
  platform: z.string().min(1, "Platform is required"),
  url: z.string().min(1, "URL is required"),
})

export const profileSchema = z.object({
  headline: z.string().max(100, "Headline must be at most 100 characters").optional().or(z.literal("")),
  bio: z.string().max(500, "Bio must be at most 500 characters").optional().or(z.literal("")),
  location: z.string().max(100, "Location must be at most 100 characters").optional().or(z.literal("")),
  experience_level: z.enum(["beginner", "intermediate", "advanced"]).optional(),
  timezone: z.string().max(50).optional().or(z.literal("")),
  languages: z.array(languageEntrySchema).optional(),
  portfolio_links: z.array(portfolioLinkEntrySchema).optional(),
})

export const availabilitySchema = z.object({
  day_of_week: z.number().int().min(0).max(6),
  start_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Invalid time format"),
  end_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/, "Invalid time format"),
}).refine(
  (data) => data.start_time < data.end_time,
  { message: "Start time must be before end time", path: ["end_time"] }
)

export type ProfileFormData = z.infer<typeof profileSchema>
