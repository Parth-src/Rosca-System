import axios from "axios"
import type {
  AuthUser,
  CreateGroupRequest,
  DashboardSummary,
  Group,
  JoinGroupRequest,
  LoginRequest,
  Membership,
  RegisterRequest,
} from "@/types"
import { mockApi } from "@/lib/mock"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined

// When no real backend URL is configured we serve realistic mock data so the
// whole app is demonstrable. Set VITE_API_BASE_URL (e.g. http://localhost:8080)
// to switch to the live Spring backend.
export const USE_MOCK = !API_BASE_URL

const TOKEN_KEY = "circl_token"

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export const http = axios.create({
  baseURL: API_BASE_URL ? `${API_BASE_URL}/api` : "/api",
  headers: { "Content-Type": "application/json" },
})

// JWT injection interceptor
http.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      clearToken()
    }
    return Promise.reject(error)
  },
)

// --- Auth ------------------------------------------------------------------
export const authApi = {
  login: (req: LoginRequest): Promise<AuthUser> =>
    USE_MOCK ? mockApi.login(req) : http.post("/auth/login", req).then((r) => r.data),
  register: (req: RegisterRequest): Promise<AuthUser> =>
    USE_MOCK ? mockApi.register(req) : http.post("/auth/register", req).then((r) => r.data),
}

// --- Groups ----------------------------------------------------------------
export const groupApi = {
  getAll: (): Promise<Group[]> =>
    USE_MOCK ? mockApi.getAllGroups() : http.get("/groups").then((r) => r.data),
  getOne: (id: number): Promise<Group> =>
    USE_MOCK ? mockApi.getGroup(id) : http.get(`/groups/${id}`).then((r) => r.data),
  create: (req: CreateGroupRequest): Promise<Group> =>
    USE_MOCK ? mockApi.createGroup(req) : http.post("/groups", req).then((r) => r.data),
}

// --- Memberships -----------------------------------------------------------
export const membershipApi = {
  getUserMemberships: (userId: number): Promise<Membership[]> =>
    USE_MOCK ? mockApi.getUserMemberships(userId) : http.get(`/memberships/user/${userId}`).then((r) => r.data),
  getGroupRoster: (groupId: number): Promise<Membership[]> =>
    // Real backend has no dedicated roster endpoint yet; reuse mock for demo.
    USE_MOCK ? mockApi.getGroupRoster(groupId) : http.get(`/memberships/user/${groupId}`).then((r) => r.data),
  join: (req: JoinGroupRequest): Promise<Membership> =>
    USE_MOCK ? mockApi.joinGroup(req) : http.post("/memberships/join", req).then((r) => r.data),
}

// --- Dashboard -------------------------------------------------------------
export const dashboardApi = {
  getSummary: (): Promise<DashboardSummary> =>
    USE_MOCK ? mockApi.getDashboardSummary() : http.get("/dashboard/summary").then((r) => r.data),
}
