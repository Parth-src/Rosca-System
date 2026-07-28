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