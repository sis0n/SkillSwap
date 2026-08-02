import type {
  ExchangeRequest,
  ExchangeRequestRole,
  ExchangeRequestSkill,
  ExchangeRequestStatus,
  ExchangeRequestUser,
} from "./types/exchange-request"

export const exchangeRequestStatusLabels: Record<ExchangeRequestStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  declined: "Declined",
  cancelled: "Cancelled",
}

export const exchangeRequestStatusColors: Record<ExchangeRequestStatus, string> = {
  pending:
    "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  accepted:
    "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  declined:
    "border-transparent bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  cancelled:
    "border-transparent bg-zinc-100 text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-400",
}

export const exchangeRequestSkillColors: Record<string, string> = {
  teaching:
    "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-400",
  learning:
    "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-400",
}

export const experienceLevelColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  intermediate:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  advanced:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  expert: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

export function getInitials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
}

export function getDisplayName(user: ExchangeRequestUser): string {
  return [user.first_name, user.middle_name, user.last_name, user.suffix]
    .filter(Boolean)
    .join(" ")
}

export function getRequestRole(
  request: ExchangeRequest,
  currentUserId: number,
): ExchangeRequestRole | null {
  if (request.sender.id === currentUserId) return "sender"
  if (request.receiver.id === currentUserId) return "receiver"
  return null
}

export function getOtherParty(
  request: ExchangeRequest,
  currentUserId: number,
): ExchangeRequestUser {
  return request.sender.id === currentUserId ? request.receiver : request.sender
}

export function getSkillDisplayName(skill: ExchangeRequestSkill): string {
  return skill.title || skill.skill.name
}

export function formatRequestDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatRequestDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function toExchangeRequestUser(source: {
  id: number
  first_name: string
  middle_name: string | null
  last_name: string
  suffix: string | null
  username: string
  headline?: string | null
  avatar_url?: string | null
  profile?: { avatar_url: string | null; headline: string | null } | null
}): ExchangeRequestUser {
  return {
    id: source.id,
    first_name: source.first_name,
    middle_name: source.middle_name,
    last_name: source.last_name,
    suffix: source.suffix,
    username: source.username,
    profile: {
      avatar_url: source.profile?.avatar_url ?? source.avatar_url ?? null,
      headline: source.profile?.headline ?? source.headline ?? null,
    },
  }
}
