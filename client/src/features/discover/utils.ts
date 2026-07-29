import type { DiscoverUser } from "./types/discover"

export const experienceLevelColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  intermediate: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  advanced: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  expert: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
}

export function getInitials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
}

export function getDisplayName(user: DiscoverUser): string {
  const parts = [user.first_name, user.middle_name, user.last_name, user.suffix].filter(Boolean)
  return parts.join(" ")
}
