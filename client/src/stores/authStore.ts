import { create } from "zustand"

import type { User } from "@/lib/api/auth"
import { getCsrfCookie, getMe } from "@/lib/api/auth"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  initialize: () => Promise<void>
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    set({ isLoading: true })

    try {
      await getCsrfCookie()
    } catch {
      set({ isLoading: false, isInitialized: true })
      return
    }

    try {
      const response = await getMe()
      if (response.success) {
        set({
          user: response.data,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        })
      } else {
        set({ isLoading: false, isInitialized: true })
      }
    } catch {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      })
    }
  },

  setUser: (user: User | null) =>
    set({
      user,
      isAuthenticated: user !== null,
    }),
}))
