import { zodResolver } from "@hookform/resolvers/zod"
import { isAxiosError } from "axios"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link, useSearchParams } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import GoogleLoginButton from "@/components/auth/GoogleLoginButton"
import { useLogin } from "@/hooks/useAuth"

import { loginSchema, type LoginFormData } from "../schemas/authSchemas"

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const justVerified = searchParams.get("verified") === "true"
  const loginMutation = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: LoginFormData) {
    try {
      await loginMutation.mutateAsync(data)
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        const { status, data: responseData } = error.response

        if (status === 422) {
          const apiErrors = responseData.errors as Record<string, string[]>
          for (const [field, messages] of Object.entries(apiErrors)) {
            setError(field as keyof LoginFormData, {
              message: messages[0],
            })
          }
          return
        }

        if (status === 401) {
          setError("root", {
            message: responseData.message || "Invalid email or password.",
          })
          return
        }

        if (status === 403) {
          setError("root", {
            message: responseData.message || "Please verify your email before logging in.",
          })
          return
        }

        if (status === 419) {
          setError("root", {
            message: "Session expired. Please refresh the page and try again.",
          })
          return
        }

        setError("root", {
          message: responseData.message || "An unexpected error occurred. Please try again.",
        })
        return
      }

      if (isAxiosError(error) && !error.response) {
        setError("root", {
          message: "Unable to connect to the server. Please check your internet connection.",
        })
        return
      }

      setError("root", {
        message: "An unexpected error occurred. Please try again.",
      })
    }
  }

  const isPending = isSubmitting || loginMutation.isPending

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in to your SkillSwap account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
            {justVerified && (
              <div className="flex items-start gap-2 rounded-md border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                <span>Email verified successfully! You can now sign in.</span>
              </div>
            )}

            {errors.root && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <div>
                  <span>{errors.root.message}</span>
                  {errors.root.message?.includes("verify") && (
                    <Link
                      to={`/verify-email?email=${encodeURIComponent(
                        (document.getElementById("email") as HTMLInputElement)?.value || ""
                      )}`}
                      className="ml-1 font-medium underline underline-offset-2"
                    >
                      Resend code
                    </Link>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                disabled={isPending}
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                disabled={isPending}
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isPending}
            >
              {isPending ? "Signing in..." : "Sign In"}
            </Button>

            <GoogleLoginButton />
          </CardContent>
        </form>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
