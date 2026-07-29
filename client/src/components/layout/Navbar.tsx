import { Moon, Sun } from "lucide-react"
import { Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useTheme } from "@/hooks/useTheme"
import { useAuthStore } from "@/stores/authStore"

export function Navbar() {
  const { mode, setMode } = useTheme()
  const user = useAuthStore((state) => state.user)

  function toggleTheme() {
    const next = mode === "dark" ? "light" : "dark"
    setMode(next)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          SkillSwap
        </Link>

        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link to="/discover">Discover</Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {mode === "dark" ? (
              <Sun className="size-5" />
            ) : (
              <Moon className="size-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>

          {user ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/profile">Profile</Link>
              </Button>
              <Button asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  )
}
