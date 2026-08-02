export type ExchangeRequestStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "cancelled"

export type ExchangeRequestTab = "received" | "sent"

export type ExchangeRequestRole = "sender" | "receiver"

export interface ExchangeRequestUser {
  id: number
  first_name: string
  middle_name: string | null
  last_name: string
  suffix: string | null
  username: string
  profile?: {
    avatar_url: string | null
    headline: string | null
  } | null
}

export interface ExchangeRequestSkill {
  id: number
  skill_id: number
  skill: {
    id: number
    name: string
    slug: string
  }
  type: "teaching" | "learning"
  title: string | null
  experience_level: "beginner" | "intermediate" | "advanced" | "expert"
}

export interface ExchangeRequestHistory {
  id: number
  edited_by: ExchangeRequestUser | null
  teaching_skill: ExchangeRequestSkill | null
  learning_skill: ExchangeRequestSkill | null
  message: string | null
  status: ExchangeRequestStatus | null
  created_at: string
}

export interface ExchangeRequest {
  id: number
  sender: ExchangeRequestUser
  receiver: ExchangeRequestUser
  teaching_skill: ExchangeRequestSkill | null
  learning_skill: ExchangeRequestSkill | null
  message: string | null
  status: ExchangeRequestStatus
  reconfirmation_required_by: "sender" | "receiver" | null
  history: ExchangeRequestHistory[]
  created_at: string
  updated_at: string
}

export interface SendExchangeRequestData {
  receiver_id: number
  teaching_skill_id?: number | null
  learning_skill_id?: number | null
  message?: string | null
}
