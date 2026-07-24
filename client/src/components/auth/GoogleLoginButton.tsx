import { ChromeIcon } from "lucide-react"
import { useSearchParams } from "react-router-dom"

import { Button } from "@/components/ui/button"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080"

export default function GoogleLoginButton() {
  const [searchParams] = useSearchParams()
  const oauthError = searchParams.get("error")

  function handleGoogleLogin() {
    window.location.href = `${API_URL}/auth/google/redirect`
  }

  return (
    <>
      {oauthError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {decodeURIComponent(oauthError)}
        </div>
      )}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            or continue with
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleGoogleLogin}
      >
        <ChromeIcon className="mr-2 size-4" />
        Sign in with Google
      </Button>
    </>
  )
}
