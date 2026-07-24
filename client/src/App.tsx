import { QueryClientProvider } from "@tanstack/react-query"
import { Suspense, lazy, useEffect } from "react"
import { BrowserRouter, Route, Routes } from "react-router-dom"

import { ErrorBoundary } from "@/components/shared/ErrorBoundary"
import { GuestRoute } from "@/components/layout/GuestRoute"
import { ProtectedRoute } from "@/components/layout/ProtectedRoute"
import { PublicLayout } from "@/components/layout/PublicLayout"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { queryClient } from "@/lib/queryClient"
import { useAuthStore } from "@/stores/authStore"

const Landing = lazy(() => import("./pages/Landing"))
const Dashboard = lazy(() => import("./pages/Dashboard"))
const LoginPage = lazy(
  () => import("@/features/auth/pages/LoginPage")
)
const RegisterPage = lazy(
  () => import("@/features/auth/pages/RegisterPage")
)
const EmailVerificationPage = lazy(
  () => import("@/features/auth/pages/EmailVerificationPage")
)
const OAuthCallbackPage = lazy(
  () => import("@/features/auth/pages/OAuthCallbackPage")
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
                <Route element={<PublicLayout />}>
                  <Route index element={<Landing />} />
                  <Route element={<GuestRoute />}>
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                  </Route>
                  <Route path="verify-email" element={<EmailVerificationPage />} />
                  <Route path="auth/callback" element={<OAuthCallbackPage />} />
                  <Route element={<ProtectedRoute />}>
                    <Route path="dashboard" element={<Dashboard />} />
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
