import { useEffect } from "react"
import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { userApi } from "@/lib/api"

export const Route = createFileRoute("/oauth2/redirect")({
  component: OAuth2RedirectPage,
})

function OAuth2RedirectPage() {
  const navigate = useNavigate()
  const router = useRouter()
  const { login } = useAuth()
  const queryClient = useQueryClient()

  useEffect(() => {
    async function handleAuth() {
      // The backend redirects here with ?token=ey...
      const urlParams = new URLSearchParams(window.location.search)
      const token = urlParams.get("token")

      if (!token) {
        navigate({ to: "/login" })
        return
      }

      try {
        // Save the token manually so userApi can use it
        localStorage.setItem("circl_token", token)

        // Force a reload for simplicity so AuthContext initializes with the new token.
        window.location.href = "/dashboard"

      } catch (error) {
        console.error("OAuth2 setup failed:", error)
        localStorage.removeItem("circl_token")
        navigate({ to: "/login" })
      }
    }

    handleAuth()
  }, [navigate, router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <h2 className="mt-6 font-serif text-2xl font-semibold">Completing sign in...</h2>
      <p className="mt-2 text-muted-foreground">Please wait while we set up your session.</p>
    </div>
  )
}
