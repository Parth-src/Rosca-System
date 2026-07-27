import { Navigate, Route, Routes } from "react-router-dom"
import { ProtectedRoute } from "@/components/layout/protected-route"
import { AppLayout } from "@/components/layout/app-layout"
import { LandingPage } from "@/pages/landing"
import { LoginPage } from "@/pages/login"
import { RegisterPage } from "@/pages/register"
import { DashboardPage } from "@/pages/dashboard"
import { GroupsPage } from "@/pages/groups"
import { CreateGroupPage } from "@/pages/create-group"
import { GroupDetailPage } from "@/pages/group-detail"
import { ComingSoonPage } from "@/pages/coming-soon"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/groups" element={<GroupsPage />} />
          <Route path="/groups/create" element={<CreateGroupPage />} />
          <Route path="/groups/:id" element={<GroupDetailPage />} />
          <Route path="/wallet" element={<ComingSoonPage title="Wallet" />} />
          <Route path="/profile" element={<ComingSoonPage title="Risk Profile" />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
