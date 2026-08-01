import { z } from "zod"

export const exchangeRequestStatuses = [
  "pending",
  "accepted",
  "declined",
  "cancelled",
] as const

export const sendExchangeRequestSchema = z.object({
  receiver_id: z.number({ message: "Receiver is required" }),
  teaching_skill_id: z.number().optional().nullable(),
  learning_skill_id: z.number().optional().nullable(),
  message: z
    .string()
    .max(500, "Message must be 500 characters or fewer")
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined
      const trimmed = value.trim()
      return trimmed === "" ? null : trimmed
    }),
})

export type SendExchangeRequestFormData = z.infer<
  typeof sendExchangeRequestSchema
>
