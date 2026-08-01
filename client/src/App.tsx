import { QueryClientProvider } from "@tanstack/react-query"
import { Suspense, lazy, useEffect } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"

import { AuthenticatedLayout } from "@/components/layout/AuthenticatedLayout"
import { ErrorBoundary } from "@/components/shared/ErrorBoundary"
import { GuestRoute } from "@/components/layout/GuestRoute"
import { ProtectedRoute } from "@/components/layout/ProtectedRoute"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { queryClient } from "@/lib/queryClient"
import { useAuthStore } from "@/stores/authStore"

const Landing = lazy(() => import("./pages/Landing"))
const Dashboard = lazy(() => import("./pages/Dashboard"))
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"))
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage"))
const EmailVerificationPage = lazy(() => import("@/features/auth/pages/EmailVerificationPage"))
const OAuthCallbackPage = lazy(() => import("@/features/auth/pages/OAuthCallbackPage"))
const ProfilePage = lazy(() => import("@/features/profile/pages/ProfilePage"))
const PublicProfilePage = lazy(() => import("@/features/profile/pages/PublicProfilePage"))
const SkillsPage = lazy(() => import("@/features/skills/pages/SkillsPage"))
const DiscoverPage = lazy(() => import("@/features/discover/pages/DiscoverPage"))
const ExchangeRequestsPage = lazy(
  () => import("@/features/exchange-request/pages/ExchangeRequestsPage"),
)

function AuthInit({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize)
  const isInitialized = useAuthStore((state) => state.isInitialized)

  useEffect(() => {
    if (!isInitialized) {
      initialize()
    }
  }, [initialize, isInitialized])

  return <>{children}</>
}

function DiscoverPageWrapper() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isInitialized = useAuthStore((state) => state.isInitialized)

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <AuthenticatedLayout />
    )
  }

  return <PublicLayout />
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthInit>
            <Suspense
              fallback={
                <div className="flex min-h-screen items-center justify-center">
                  <LoadingSpinner size="lg" />
                </div>
              }
            >
              <Routes>
                <Route path="discover" element={<DiscoverPageWrapper />}>
                  <Route index element={<DiscoverPage />} />
                </Route>

                <Route element={<PublicLayout />}>
                  <Route element={<GuestRoute />}>
                    <Route index element={<Landing />} />
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                  </Route>
                  <Route path="verify-email" element={<EmailVerificationPage />} />
                  <Route path="auth/callback" element={<OAuthCallbackPage />} />
                  <Route path="users/:username" element={<PublicProfilePage />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                  <Route element={<AuthenticatedLayout />}>
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="skills" element={<SkillsPage />} />
                    <Route
                      path="exchange-requests"
                      element={<ExchangeRequestsPage />}
                    />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </AuthInit>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
