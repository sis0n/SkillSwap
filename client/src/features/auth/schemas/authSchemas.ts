import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required"),
})

export const registerSchema = z.object({
  first_name: z
    .string()
    .min(1, "First name is required"),
  last_name: z
    .string()
    .min(1, "Last name is required"),
  username: z
    .string()
    .min(1, "Username is required")
    .min(3, "Username must be at least 3 characters"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
  password_confirmation: z
    .string()
    .min(1, "Please confirm your password"),
}).refine(
  (data) => data.password === data.password_confirmation,
  {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  }
)

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
