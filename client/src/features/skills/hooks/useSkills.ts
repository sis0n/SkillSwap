import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import type { UserSkillCreateData, UserSkillUpdateData } from "@/lib/api/skills"
import * as skillsApi from "@/lib/api/skills"

export function useSkillCategories() {
  return useQuery({
    queryKey: ["skill-categories"],
    queryFn: async () => {
      const response = await skillsApi.getSkillCategories()
      if (!response.success) throw new Error(response.message)
      return response.data.skill_categories
    },
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

export function useSkills(params?: { search?: string; category_id?: number }) {
  return useQuery({
    queryKey: ["skills", params],
    queryFn: async () => {
      const response = await skillsApi.getSkills(params)
      if (!response.success) throw new Error(response.message)
      return response.data.skills
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useMySkills(params?: { category_id?: number }) {
  return useQuery({
    queryKey: ["my-skills", params],
    queryFn: async () => {
      const response = await skillsApi.getMySkills(params)
      if (!response.success) throw new Error(response.message)
      return response.data.user_skills
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useCreateUserSkill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: UserSkillCreateData) => skillsApi.createUserSkill(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["my-skills"] })
        queryClient.invalidateQueries({ queryKey: ["profile", "me"] })
      }
    },
  })
}

export function useUpdateUserSkill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserSkillUpdateData }) =>
      skillsApi.updateUserSkill(id, data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["my-skills"] })
        queryClient.invalidateQueries({ queryKey: ["profile", "me"] })
      }
    },
  })
}

export function useDeleteUserSkill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => skillsApi.deleteUserSkill(id),
    onSuccess: (response) => {
      if (response.success !== false) {
        queryClient.invalidateQueries({ queryKey: ["my-skills"] })
        queryClient.invalidateQueries({ queryKey: ["profile", "me"] })
      }
    },
  })
}
