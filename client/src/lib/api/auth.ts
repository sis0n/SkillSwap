import api from "@/lib/axios"
import type { ApiResponse } from "@/lib/api/types"

export interface RegisterData {
  first_name: string
  middle_name?: string
  last_name: string
  suffix?: string
  username: string
  email: string
  password: string
  password_confirmation: string
}

export interface LoginData {
  email: string
  password: string
}

export interface User {
  id: number
  first_name: string
  middle_name: string | null
  last_name: string
  suffix: string | null
  username: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

export interface AuthData {
  user: User
}

export interface RegisterResponse {
  email: string
}

export interface SendCodeResponse {
  expires_at: string
}

export function getCsrfCookie(): Promise<void> {
  return api.get("/sanctum/csrf-cookie")
}

export async function getMe(): Promise<ApiResponse<User>> {
  const response = await api.get<ApiResponse<{ user: User }>>("/api/v1/auth/me")
  if (response.data.success) {
    return {
      ...response.data,
      data: response.data.data.user,
    }
  }
  return response.data
}

export async function login(data: LoginData): Promise<ApiResponse<AuthData>> {
  const response = await api.post<ApiResponse<AuthData>>("/api/v1/auth/login", data)
  return response.data
}

export async function register(data: RegisterData): Promise<ApiResponse<RegisterResponse>> {
  const response = await api.post<ApiResponse<RegisterResponse>>("/api/v1/auth/register", data)
  return response.data
}

export async function logout(): Promise<void> {
  await api.post("/api/v1/auth/logout")
}

export async function sendVerificationCode(email: string): Promise<ApiResponse<SendCodeResponse>> {
  const response = await api.post<ApiResponse<SendCodeResponse>>("/api/v1/auth/email/send-code", { email })
  return response.data
}

export async function verifyCode(email: string, code: string): Promise<ApiResponse<void>> {
  const response = await api.post<ApiResponse<void>>("/api/v1/auth/email/verify-code", { email, code })
  return response.data
}
