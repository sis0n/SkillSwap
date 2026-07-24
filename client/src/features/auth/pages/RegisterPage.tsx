import { zodResolver } from "@hookform/resolvers/zod"
import { isAxiosError } from "axios"
import { AlertCircle } from "lucide-react"
import { useForm } from "react-hook-form"
import { Link } from "react-router-dom"

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
import { useRegister } from "@/hooks/useAuth"

import { registerSchema, type RegisterFormData } from "../schemas/authSchemas"

export default function RegisterPage() {
  const registerMutation = useRegister()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  })

  async function onSubmit(data: RegisterFormData) {
    try {
      await registerMutation.mutateAsync(data)
    } catch (error) {
      if (isAxiosError(error) && error.response) {
        const { status, data: responseData } = error.response

        if (status === 422) {
          const apiErrors = responseData.errors as Record<string, string[]>
          for (const [field, messages] of Object.entries(apiErrors)) {
            setError(field as keyof RegisterFormData, {
              message: messages[0],
            })
          }
          return
        }

        if (status === 409) {
          setError("root", {
            message: responseData.message || "This email is already registered.",
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

  const isPending = isSubmitting || registerMutation.isPending

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>
            Join SkillSwap and start exchanging knowledge
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <CardContent className="space-y-4">
            {errors.root && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <span>{errors.root.message}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First name</Label>
                <Input
                  id="first_name"
                  placeholder="John"
                  disabled={isPending}
                  aria-invalid={!!errors.first_name}
                  {...register("first_name")}
                />
                {errors.first_name && (
                  <p className="text-sm text-destructive">
                    {errors.first_name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last name</Label>
                <Input
                  id="last_name"
                  placeholder="Doe"
                  disabled={isPending}
                  aria-invalid={!!errors.last_name}
                  {...register("last_name")}
                />
                {errors.last_name && (
                  <p className="text-sm text-destructive">
                    {errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="johndoe"
                disabled={isPending}
                aria-invalid={!!errors.username}
                {...register("username")}
              />
              {errors.username && (
                <p className="text-sm text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>

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
                placeholder="At least 8 characters"
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

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">
                Confirm password
              </Label>
              <Input
                id="password_confirmation"
                type="password"
                placeholder="Repeat your password"
                disabled={isPending}
                aria-invalid={!!errors.password_confirmation}
                {...register("password_confirmation")}
              />
              {errors.password_confirmation && (
                <p className="text-sm text-destructive">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isPending}
            >
              {isPending ? "Creating account..." : "Create account"}
            </Button>

            <GoogleLoginButton />
          </CardContent>
        </form>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
