import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface ApiErrorPayload {
  response?: {
    data?: {
      message?: string
      errors?: Record<string, string[]>
    }
  }
}

export function getApiErrorMessage(error: unknown): string {
  const payload = error as ApiErrorPayload
  return payload?.response?.data?.message ?? "Something went wrong. Please try again."
}

export function getApiFieldErrors(error: unknown): Record<string, string> {
  const payload = error as ApiErrorPayload
  const errors = payload?.response?.data?.errors
  if (!errors) return {}
  return Object.fromEntries(
    Object.entries(errors).map(([key, messages]) => [key, messages[0]]),
  )
}
