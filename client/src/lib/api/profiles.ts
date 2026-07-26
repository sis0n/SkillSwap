import api from "@/lib/axios"
import type {
  ApiResponse,
  AvailabilityInput,
  AvailabilitySlot,
  CreatePortfolioLinkData,
  Language,
  Profile,
  PortfolioLink,
  UpdatePortfolioLinkData,
  UpdateProfileData,
  UserProfile,
} from "@/lib/api/types"

export async function getMyProfile(): Promise<ApiResponse<UserProfile>> {
  const response = await api.get<ApiResponse<{ user: UserProfile }>>("/api/v1/me/profile")
  if (response.data.success) {
    return { ...response.data, data: response.data.data.user }
  }
  return response.data
}

export async function updateProfile(data: UpdateProfileData): Promise<ApiResponse<{ profile: Profile }>> {
  const response = await api.put<ApiResponse<{ profile: Profile }>>("/api/v1/me/profile", data)
  return response.data
}

export async function getPublicProfile(username: string): Promise<ApiResponse<UserProfile>> {
  const response = await api.get<ApiResponse<{ user: UserProfile }>>(`/api/v1/users/${encodeURIComponent(username)}`)
  if (response.data.success) {
    return { ...response.data, data: response.data.data.user }
  }
  return response.data
}

export async function uploadAvatar(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<ApiResponse<{ avatar_url: string }>> {
  const formData = new FormData()
  formData.append("avatar", file)
  const response = await api.post<ApiResponse<{ avatar_url: string }>>("/api/v1/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (e.total && onProgress) {
        onProgress(Math.round((e.loaded * 100) / e.total))
      }
    },
  })
  return response.data
}

export async function deleteAvatar(): Promise<ApiResponse<void>> {
  await api.delete("/api/v1/me/avatar")
  return { success: true, message: "Avatar removed.", data: undefined }
}

export async function getAvailability(): Promise<ApiResponse<{ availability: AvailabilitySlot[] }>> {
  const response = await api.get<ApiResponse<{ availability: AvailabilitySlot[] }>>("/api/v1/me/availability")
  return response.data
}

export async function updateAvailability(availability: AvailabilityInput[]): Promise<ApiResponse<{ availability: AvailabilitySlot[] }>> {
  const response = await api.put<ApiResponse<{ availability: AvailabilitySlot[] }>>("/api/v1/me/availability", { availability })
  return response.data
}

export async function getLanguages(): Promise<ApiResponse<{ languages: Language[] }>> {
  const response = await api.get<ApiResponse<{ languages: Language[] }>>("/api/v1/languages")
  return response.data
}

export async function createPortfolioLink(data: CreatePortfolioLinkData): Promise<ApiResponse<{ portfolio_link: PortfolioLink }>> {
  const response = await api.post<ApiResponse<{ portfolio_link: PortfolioLink }>>("/api/v1/me/portfolio-links", data)
  return response.data
}

export async function updatePortfolioLink(id: number, data: UpdatePortfolioLinkData): Promise<ApiResponse<{ portfolio_link: PortfolioLink }>> {
  const response = await api.put<ApiResponse<{ portfolio_link: PortfolioLink }>>(`/api/v1/me/portfolio-links/${id}`, data)
  return response.data
}

export async function deletePortfolioLink(id: number): Promise<void> {
  await api.delete(`/api/v1/me/portfolio-links/${id}`)
}

export async function reorderPortfolioLinks(orderedIds: number[]): Promise<ApiResponse<{ portfolio_links: PortfolioLink[] }>> {
  const response = await api.put<ApiResponse<{ portfolio_links: PortfolioLink[] }>>("/api/v1/me/portfolio-links/reorder", { ordered_ids: orderedIds })
  return response.data
}
