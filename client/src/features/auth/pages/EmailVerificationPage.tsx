import { isAxiosError } from "axios"
import { AlertCircle, CheckCircle2, Clock, Info, Mail, RefreshCw } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link, useLocation, useSearchParams } from "react-router-dom"

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
import {
  useSendVerificationCode,
  useVerifyEmailCode,
} from "@/hooks/useAuth"

const CODE_LENGTH = 6
const RESEND_COOLDOWN = 60

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const email = searchParams.get("email") ?? ""
  const registrationMessage = (location.state as { registrationMessage?: string })?.registrationMessage

  const sendCodeMutation = useSendVerificationCode()
  const verifyCodeMutation = useVerifyEmailCode()
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""))
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [verified, setVerified] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)

  const isPending = sendCodeMutation.isPending || verifyCodeMutation.isPending

  const sendCode = async () => {
    if (!email) return
    setError(null)
    setCooldown(RESEND_COOLDOWN)

    try {
      const response = await sendCodeMutation.mutateAsync(email)
      if (response.success) {
        setSuccess("Verification code sent to your email.")
        if (response.data?.expires_at) {
          setExpiresAt(response.data.expires_at)
        }
      }
    } catch (err) {
      setCooldown(0)
      if (isAxiosError(err) && err.response) {
        const { status, data } = err.response
        if (status === 429) {
          const retryAfter = data?.errors?.retry_after ?? RESEND_COOLDOWN
          setCooldown(Number(retryAfter))
          setError(data.message || "Please wait before requesting a new code.")
          return
        }
        setError(data.message || "Failed to send verification code.")
        return
      }
      setError("Unable to connect to the server.")
    }
  }

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1)
    }
    if (value !== "" && !/^\d$/.test(value)) return

    setError(null)
    const newDigits = [...digits]
    newDigits[index] = value
    setDigits(newDigits)

    if (value !== "" && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    const code = newDigits.join("")
    if (code.length === CODE_LENGTH && newDigits.every((d) => d !== "")) {
      submitCode(code)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && digits[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH)
    if (pasted.length !== CODE_LENGTH) return

    const newDigits = pasted.split("")
    setDigits(newDigits)
    inputRefs.current[CODE_LENGTH - 1]?.focus()

    if (newDigits.every((d) => d !== "")) {
      submitCode(pasted)
    }
  }

  const submitCode = async (code: string) => {
    setError(null)
    setSuccess(null)

    try {
      await verifyCodeMutation.mutateAsync({ email, code })
      setDigits(Array(CODE_LENGTH).fill(""))
      setVerified(true)
    } catch (err) {
      if (isAxiosError(err) && err.response) {
        const { status, data } = err.response
        if (status === 422) {
          const apiErrors = data?.errors as Record<string, string[]> | undefined
          setError(apiErrors?.code?.[0] || data.message || "Invalid verification code.")
          return
        }
        setError(data.message || "Failed to verify code.")
        return
      }
      setError("Unable to connect to the server.")
    }
  }

  const handleResend = () => {
    setDigits(Array(CODE_LENGTH).fill(""))
    setSuccess(null)
    setError(null)
    inputRefs.current[0]?.focus()
    sendCode()
  }

  if (!email) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              No email provided. Please{" "}
              <Link to="/register" className="font-medium text-primary hover:underline">
                register
              </Link>{" "}
              first.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (verified) {
    return (
      <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="size-6 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Email verified!</CardTitle>
            <CardDescription>
              Your email has been successfully verified. You can now sign in to your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
            <Mail className="size-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>
            We sent a 6-digit verification code to <strong>{email}</strong>.
            Enter it below to activate your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {registrationMessage && (
            <div className="flex items-start gap-2 rounded-md border border-blue-500/50 bg-blue-500/10 p-3 text-sm text-blue-600 dark:text-blue-400">
              <Info className="mt-0.5 size-4 shrink-0" />
              <span>{registrationMessage}</span>
            </div>
          )}

          {expiresAt && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-4" />
              <span>
                Code expires at{" "}
                {new Date(expiresAt).toLocaleTimeString()}
              </span>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 rounded-md border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label>Verification Code</Label>
            <div className="flex justify-center gap-2">
              {digits.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  disabled={isPending}
                  onChange={(e) => handleDigitChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="size-12 text-center text-lg tabular-nums"
                  aria-label={`Digit ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={cooldown > 0 || isPending}
            onClick={handleResend}
          >
            <RefreshCw
              className={`mr-2 size-4 ${sendCodeMutation.isPending ? "animate-spin" : ""}`}
            />
            {cooldown > 0
              ? `Resend code in ${cooldown}s`
              : "Resend code"}
          </Button>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already verified?{" "}
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
