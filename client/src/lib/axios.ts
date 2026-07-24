import axios from "axios"

import { useAuthStore } from "@/stores/authStore"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error

    if (!response) {
      return Promise.reject(error)
    }

    if (response.status === 419 && !config._retry) {
      config._retry = true
      try {
        await api.get("/sanctum/csrf-cookie")
        return api(config)
      } catch {
        return Promise.reject(error)
      }
    }

    if (response.status === 401) {
      useAuthStore.getState().setUser(null)
    }

    return Promise.reject(error)
  }
)

export default api
