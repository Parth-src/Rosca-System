import { createFileRoute, Link, useNavigate } from "@tanstack/react-router"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { AuthLayout } from "@/components/layout/auth-layout"
import { AuthProvider, useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { USE_MOCK } from "@/lib/api"

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Circl" },
      { name: "description", content: "Sign in to manage your Circl savings circles and payouts." },
      { property: "og:title", content: "Sign in — Circl" },
      { property: "og:description", content: "Sign in to manage your Circl savings circles and payouts." },
    ],
  }),
  component: () => (
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  ),
})

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
})
type FormValues = z.infer<typeof schema>

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: USE_MOCK ? { email: "alex@circl.app", password: "demo1234" } : undefined,
  })

  const onSubmit = async (values: FormValues) => {
    try {
      await login(values)
      toast.success("Welcome back to Circl")
      navigate({ to: "/dashboard" })
    } catch (err) {
      toast.error((err as Error)?.message ?? "Invalid email or password")
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to manage your circles and payouts.">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" autoComplete="email" {...register("email")} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" autoComplete="current-password" {...register("password")} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>
        <Button type="submit" size="lg" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button asChild variant="outline" size="lg" className="w-full gap-2 font-medium">
          <a href="http://localhost:8080/oauth2/authorization/google">
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Google
          </a>
        </Button>
        {USE_MOCK && (
          <p className="rounded-lg bg-secondary px-3 py-2 text-center text-xs text-muted-foreground">
            Demo mode — any credentials work while the backend is offline.
          </p>
        )}
        <p className="text-center text-sm text-muted-foreground">
          New to Circl?{" "}
          <Link to="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}