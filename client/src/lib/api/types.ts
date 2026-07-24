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
