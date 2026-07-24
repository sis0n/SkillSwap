import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import type { LoginData, RegisterData } from "@/lib/api/auth"
import * as authApi from "@/lib/api/auth"
import { useAuthStore } from "@/stores/authStore"

export function useCurrentUser() {
  const setUser = useAuthStore((state) => state.setUser)

  const query = useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await authApi.getMe()
      if (!response.success) {
        throw new Error(response.message)
      }
      return response.data
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (query.data) {
      setUser(query.data)
    }
  }, [query.data, setUser])

  return query
}

export function useLogin() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: LoginData) => authApi.login(data),
    onSuccess: (response) => {
      if (response.success) {
        setUser(response.data.user)
        queryClient.setQueryData(["auth", "me"], response.data.user)
        navigate("/dashboard")
      }
    },
  })
}

export function useRegister() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (data: RegisterData) => authApi.register(data),
    onSuccess: (response) => {
      if (response.success) {
        navigate(
          `/verify-email?email=${encodeURIComponent(response.data.email)}`,
          { state: { registrationMessage: response.message } }
        )
      }
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      setUser(null)
      queryClient.clear()
      navigate("/login")
    },
  })
}

export function useSendVerificationCode() {
  return useMutation({
    mutationFn: (email: string) => authApi.sendVerificationCode(email),
  })
}

export function useVerifyEmailCode() {
  const navigate = useNavigate()

  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      authApi.verifyCode(email, code),
    onSuccess: (response) => {
      if (response.success) {
        navigate("/login?verified=true")
      }
    },
  })
}
