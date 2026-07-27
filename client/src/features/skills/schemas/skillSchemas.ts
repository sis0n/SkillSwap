import { z } from "zod"

export const experienceLevels = [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
] as const

export const skillTypes = ["teaching", "learning"] as const

export const createUserSkillSchema = z.object({
  skill_id: z.number({ required_error: "Skill is required" }),
  type: z.enum(skillTypes, { required_error: "Type is required" }),
  title: z.string().max(100).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  experience_level: z.enum(experienceLevels, { required_error: "Experience level is required" }),
  years_of_experience: z
    .union([z.number().int().min(0).max(60), z.null()])
    .optional()
    .nullable(),
  teaching_style: z.string().max(500).optional().nullable(),
  featured: z.boolean().optional().nullable(),
})

export const updateUserSkillSchema = z.object({
  title: z.string().max(100).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  experience_level: z.enum(experienceLevels).optional(),
  years_of_experience: z
    .union([z.number().int().min(0).max(60), z.null()])
    .optional()
    .nullable(),
  teaching_style: z.string().max(500).optional().nullable(),
  featured: z.boolean().optional().nullable(),
})

export type CreateUserSkillFormData = z.infer<typeof createUserSkillSchema>
export type UpdateUserSkillFormData = z.infer<typeof updateUserSkillSchema>
