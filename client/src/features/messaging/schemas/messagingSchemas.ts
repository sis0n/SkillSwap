import { z } from "zod"

export const sendMessageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(2000, "Message must be 2000 characters or fewer"),
})

export type SendMessageFormData = z.infer<typeof sendMessageSchema>
