import { Outlet, createFileRoute } from "@tanstack/react-router"
import { AuthProvider } from "@/context/AuthContext"
import { RequireAuth } from "@/components/layout/require-auth"
import { AppLayout } from "@/components/layout/app-layout"

export const Route = createFileRoute("/_app")({
  component: AppShell,
})

function AppShell() {
  return (
    <AuthProvider>
      <RequireAuth>
        <AppLayout>
          <Outlet />
        </AppLayout>
      </RequireAuth>
    </AuthProvider>
  )
}