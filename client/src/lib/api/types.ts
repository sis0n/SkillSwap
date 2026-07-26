export interface ApiError {
  success: false
  message: string
  errors?: Record<string, string[]>
}

export interface ApiSuccess<T = unknown> {
  success: true
  message: string
  data: T
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError

export interface Language {
  id: number
  code: string
  name: string
  native_name: string | null
}

export interface UserLanguage {
  code: string
  name: string
  native_name: string | null
  proficiency: "native" | "fluent" | "intermediate" | "beginner"
}

export interface Profile {
  bio: string | null
  headline: string | null
  avatar_url: string | null
  location: string | null
  experience_level: string
  timezone: string | null
}

export interface AvailabilitySlot {
  id: number
  day_of_week: number
  day_label: string
  start_time: string
  end_time: string
}

export interface UserProfile {
  id: number
  role?: {
    id: number
    name: string
    slug: string
  }
  first_name: string
  middle_name: string | null
  last_name: string
  suffix: string | null
  username: string
  email?: string
  email_verified_at?: string | null
  created_at: string
  updated_at?: string
  profile: Profile | null
  languages: UserLanguage[]
  portfolio_links: PortfolioLink[]
  availability: AvailabilitySlot[]
}

export interface LanguageInput {
  code: string
  proficiency: "native" | "fluent" | "intermediate" | "beginner"
}

export interface PortfolioLinkInput {
  platform: string
  url: string
}

export interface UpdateProfileData {
  headline?: string
  bio?: string
  location?: string
  experience_level?: string
  timezone?: string | null
  languages?: LanguageInput[]
  portfolio_links?: PortfolioLinkInput[]
}

export interface PortfolioLink {
  id: number
  platform: string
  url: string
  display_order: number
}

export interface CreatePortfolioLinkData {
  platform: string
  url: string
}

export interface UpdatePortfolioLinkData {
  platform?: string
  url?: string
}

export interface AvailabilityInput {
  day_of_week: number
  start_time: string
  end_time: string
}
