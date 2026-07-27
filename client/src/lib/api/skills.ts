import type { ApiResponse } from "@/lib/api/types"
import api from "@/lib/axios"

export interface SkillCategory {
  id: number
  name: string
  slug: string
  icon: string | null
  sort_order: number
}

export interface SkillCategoryData {
  skill_categories: SkillCategory[]
}

export interface Skill {
  id: number
  category_id: number
  name: string
  slug: string
  sort_order: number
  category?: {
    id: number
    name: string
    slug: string
  }
}

export interface SkillsData {
  skills: Skill[]
}

export interface UserSkill {
  id: number
  skill_id: number
  skill: Skill
  type: "teaching" | "learning"
  title: string | null
  description: string | null
  experience_level: "beginner" | "intermediate" | "advanced" | "expert"
  years_of_experience: number | null
  teaching_style: string | null
  featured: boolean
  created_at: string
  updated_at: string
}

export interface UserSkillsData {
  user_skills: UserSkill[]
}

export interface UserSkillCreateData {
  skill_id?: number
  skill_name?: string
  category_id?: number
  type: "teaching" | "learning"
  title?: string | null
  description?: string | null
  experience_level: "beginner" | "intermediate" | "advanced" | "expert"
  years_of_experience?: number | null
  teaching_style?: string | null
  featured?: boolean | null
}

export interface UserSkillUpdateData {
  title?: string | null
  description?: string | null
  experience_level?: "beginner" | "intermediate" | "advanced" | "expert"
  years_of_experience?: number | null
  teaching_style?: string | null
  featured?: boolean | null
}

export interface UserSkillResponse {
  user_skill: UserSkill
}

export async function getSkillCategories(): Promise<ApiResponse<SkillCategoryData>> {
  const response = await api.get("/api/v1/skill-categories")
  return response.data
}

export async function getSkills(params?: {
  search?: string
  category_id?: number
}): Promise<ApiResponse<SkillsData>> {
  const response = await api.get("/api/v1/skills", { params })
  return response.data
}

export async function getMySkills(params?: {
  category_id?: number
}): Promise<ApiResponse<UserSkillsData>> {
  const response = await api.get("/api/v1/me/skills", { params })
  return response.data
}

export async function createUserSkill(data: UserSkillCreateData): Promise<ApiResponse<UserSkillResponse>> {
  const response = await api.post("/api/v1/me/skills", data)
  return response.data
}

export async function updateUserSkill(
  id: number,
  data: UserSkillUpdateData,
): Promise<ApiResponse<UserSkillResponse>> {
  const response = await api.put(`/api/v1/me/skills/${id}`, data)
  return response.data
}

export async function deleteUserSkill(id: number): Promise<ApiResponse<null>> {
  const response = await api.delete(`/api/v1/me/skills/${id}`)
  return response.data
}
