import {
  Calendar,
  ChevronUp,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  ShoppingBag,
  Star,
  Sun,
  User,
  Users,
  X,
} from "lucide-react"
import { useState } from "react"
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { useLogout } from "@/hooks/useAuth"
import { useTheme } from "@/hooks/useTheme"
import { useAuthStore } from "@/stores/authStore"

const sidebarLinks = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Discover", href: "/discover", icon: ShoppingBag },
  { label: "My Skills", href: "/skills", icon: Users },
  { label: "Exchange Requests", href: "/exchange-requests", icon: User },
  { label: "Messages", href: "/messages", icon: MessageSquare },
  { label: "Sessions", href: "/sessions", icon: Calendar },
  { label: "Profile", href: "/profile", icon: User },
  { label: "Reviews", href: "/reviews", icon: Star },
]

export function AuthenticatedLayout() {
  const location = useLocation()
  const user = useAuthStore((state) => state.user)
  const { mode, setMode } = useTheme()
  const logoutMutation = useLogout()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-card lg:flex">
        <div className="flex h-16 shrink-0 items-center border-b px-6">
          <Link to="/dashboard" className="text-lg font-bold">
            SkillSwap
          </Link>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {sidebarLinks.map((link) => {
            const Icon = link.icon
            const isActive = location.pathname === link.href
            return (
              <Link
                key={link.href}
                to={link.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="size-4" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t p-4">
          <div className="relative">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <div className="size-9 shrink-0 overflow-hidden rounded-full bg-primary/10">
                {user?.profile?.avatar_url ? (
                  <img
                    src={user.profile.avatar_url}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-sm font-semibold text-primary">
                    {user?.username?.slice(0, 2).toUpperCase() ?? "U"}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {user ? `${user.first_name} ${user.last_name}` : "User"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email ?? ""}
                </p>
              </div>
              <ChevronUp
                className={`size-4 shrink-0 text-muted-foreground transition-transform ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute bottom-full left-0 right-0 z-20 mb-2 overflow-hidden rounded-lg border bg-popover shadow-md">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent"
                    onClick={() => {
                      setMenuOpen(false)
                      navigate("/profile")
                    }}
                  >
                    <User className="size-4" />
                    Profile
                  </button>
                  <div className="flex items-center gap-2 border-t px-4 py-2.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground"
                      onClick={() => setMode(mode === "dark" ? "light" : "dark")}
                    >
                      {mode === "dark" ? (
                        <Sun className="size-4" />
                      ) : (
                        <Moon className="size-4" />
                      )}
                    </Button>
                    <button
                      type="button"
                      className="flex flex-1 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                      onClick={() => {
                        setMenuOpen(false)
                        logoutMutation.mutate()
                      }}
                    >
                      <LogOut className="size-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 lg:hidden">
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="size-6" />
          </button>
          <Link to="/dashboard" className="text-lg font-bold">
            SkillSwap
          </Link>
          <div className="size-6" />
        </header>

        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-card lg:hidden">
              <div className="flex h-16 items-center justify-between border-b px-4">
                <Link
                  to="/dashboard"
                  className="text-lg font-bold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  SkillSwap
                </Link>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="size-5" />
                </button>
              </div>
              <nav className="space-y-1 p-4">
                {sidebarLinks.map((link) => {
                  const Icon = link.icon
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        location.pathname === link.href
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Icon className="size-4" />
                      {link.label}
                    </Link>
                  )
                })}
              </nav>
              <div className="border-t p-4">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    logoutMutation.mutate()
                  }}
                >
                  <LogOut className="size-4" />
                  Logout
                </button>
              </div>
            </div>
          </>
        )}

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
        <footer className="flex shrink-0 items-center justify-center gap-1 border-t px-4 py-3 text-xs text-muted-foreground">
          made from <Heart className="size-3 fill-current text-red-500" />
        </footer>
      </div>
    </div>
  )
}
