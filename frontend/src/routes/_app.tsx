import { Outlet, createFileRoute } from "@tanstack/react-router"
import { RequireAuth } from "@/components/layout/require-auth"
import { AppLayout } from "@/components/layout/app-layout"

export const Route = createFileRoute("/_app")({
  component: AppShell,
})

function AppShell() {
  return (
    <RequireAuth>
      <AppLayout>
        <Outlet />
      </AppLayout>
    </RequireAuth>
  )
}