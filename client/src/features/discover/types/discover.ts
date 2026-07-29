export type ExperienceLevel =
  | "beginner"
  | "intermediate"
  | "advanced"
  | "expert"

export interface DiscoverSkill {
  id: number
  name: string
  type: "teaching" | "learning"
  experience_level: ExperienceLevel
}

export interface DiscoverUser {
  id: number
  first_name: string
  middle_name: string | null
  last_name: string
  suffix: string | null
  username: string
  headline: string | null
  avatar_url: string | null
  location: string | null
  matched_skills: DiscoverSkill[]
  matched_skills_count: number
}

export interface DiscoverSearchParams {
  q?: string
  category_id?: number
  type?: "teaching" | "learning" | ""
  experience_level?: ExperienceLevel | ""
  page?: number
  per_page?: number
}

export interface DiscoverPaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface DiscoverSearchResponse {
  data: DiscoverUser[]
  meta: DiscoverPaginationMeta
}
