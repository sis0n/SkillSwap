import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { getCsrfCookie, getMe } from "@/lib/api/auth"
import { useAuthStore } from "@/stores/authStore"

export default function OAuthCallbackPage() {
  const navigate = useNavigate()
  const setUser = useAuthStore((state) => state.setUser)
  const isInitialized = useAuthStore((state) => state.isInitialized)

  useEffect(() => {
    async function finalizeAuth() {
      try {
        await getCsrfCookie()
      } catch {
        navigate("/login?error=Failed to initialize session. Please try again.")
        return
      }

      try {
        const response = await getMe()

        if (response.success) {
          setUser(response.data)
          navigate("/dashboard", { replace: true })
        } else {
          navigate("/login?error=Failed to retrieve user session.", {
            replace: true,
          })
        }
      } catch {
        navigate("/login?error=Authentication failed. Please try again.", {
          replace: true,
        })
      }
    }

    if (!isInitialized) {
      finalizeAuth()
    } else {
      navigate("/dashboard", { replace: true })
    }
  }, [navigate, setUser, isInitialized])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-muted-foreground">Completing sign in...</p>
    </div>
  )
}
