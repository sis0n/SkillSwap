import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { CreatePortfolioLinkData, UpdatePortfolioLinkData } from "@/lib/api/types"
import * as profileApi from "@/lib/api/profiles"

export function useMyProfile() {
  return useQuery({
    queryKey: ["profile", "me"],
    queryFn: async () => {
      const response = await profileApi.getMyProfile()
      if (!response.success) {
        throw new Error(response.message)
      }
      return response.data
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function usePublicProfile(username: string) {
  return useQuery({
    queryKey: ["profile", "public", username],
    queryFn: async () => {
      const response = await profileApi.getPublicProfile(username)
      if (!response.success) {
        throw new Error(response.message)
      }
      return response.data
    },
    enabled: !!username,
    retry: false,
  })
}

export function useUploadAvatar(onProgress?: (percent: number) => void) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file, onProgress),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["profile", "me"] })
      }
    },
  })
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => profileApi.deleteAvatar(),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["profile", "me"] })
      }
    },
  })
}

export function useAvailability() {
  return useQuery({
    queryKey: ["profile", "availability"],
    queryFn: async () => {
      const response = await profileApi.getAvailability()
      if (!response.success) {
        throw new Error(response.message)
      }
      return response.data.availability
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useLanguages() {
  return useQuery({
    queryKey: ["languages"],
    queryFn: async () => {
      const response = await profileApi.getLanguages()
      if (!response.success) {
        throw new Error(response.message)
      }
      return response.data.languages
    },
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

export function useUpdateAvailability() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (slots: Parameters<typeof profileApi.updateAvailability>[0]) =>
      profileApi.updateAvailability(slots),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["profile", "availability"] })
        queryClient.invalidateQueries({ queryKey: ["profile", "me"] })
      }
    },
  })
}

export function useCreatePortfolioLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePortfolioLinkData) => profileApi.createPortfolioLink(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] })
    },
  })
}

export function useUpdatePortfolioLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePortfolioLinkData }) =>
      profileApi.updatePortfolioLink(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] })
    },
  })
}

export function useDeletePortfolioLink() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => profileApi.deletePortfolioLink(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] })
    },
  })
}

export function useReorderPortfolioLinks() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (orderedIds: number[]) => profileApi.reorderPortfolioLinks(orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", "me"] })
    },
  })
}
