import type {
  Auction,
  AuthUser,
  Bid,
  CreateGroupRequest,
  DashboardSummary,
  Group,
  JoinGroupRequest,
  LoginRequest,
  Membership,
  PerformanceReport,
  RegisterRequest,
  RiskReport,
  Transaction,
} from "@/types"
import { mockApi } from "@/lib/mock"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined
export const USE_MOCK = !API_BASE_URL

const TOKEN_KEY = "circl_token"

export function getToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem(TOKEN_KEY)
}
export function setToken(token: string) {
  if (typeof window === "undefined") return
  localStorage.setItem(TOKEN_KEY, token)
}
export function clearToken() {
  if (typeof window === "undefined") return
  localStorage.removeItem(TOKEN_KEY)
}

async function http<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  }
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`${API_BASE_URL}/api${path}`, { ...init, headers })
  if (res.status === 401) clearToken()
  if (!res.ok) throw new Error((await res.text()) || res.statusText)
  return res.json() as Promise<T>
}

export const authApi = {
  login: (req: LoginRequest): Promise<AuthUser> =>
    USE_MOCK ? mockApi.login(req) : http("/auth/login", { method: "POST", body: JSON.stringify(req) }),
  register: (req: RegisterRequest): Promise<AuthUser> =>
    USE_MOCK ? mockApi.register(req) : http("/auth/register", { method: "POST", body: JSON.stringify(req) }),
}

export const userApi = {
  list: (): Promise<AuthUser[]> => (USE_MOCK ? mockApi.listUsers() : http("/users")),
  get: (id: number): Promise<AuthUser> => (USE_MOCK ? mockApi.getUser(id) : http(`/users/${id}`)),
  create: (req: RegisterRequest): Promise<AuthUser> =>
    USE_MOCK ? mockApi.adminCreateUser(req) : http("/users", { method: "POST", body: JSON.stringify(req) }),
  remove: (id: number): Promise<{ success: true }> =>
    USE_MOCK ? mockApi.deleteUser(id) : http(`/users/${id}`, { method: "DELETE" }),
}

export const groupApi = {
  getAll: (): Promise<Group[]> => (USE_MOCK ? mockApi.getAllGroups() : http("/groups")),
  getOne: (id: number): Promise<Group> => (USE_MOCK ? mockApi.getGroup(id) : http(`/groups/${id}`)),
  create: (req: CreateGroupRequest): Promise<Group> =>
    USE_MOCK ? mockApi.createGroup(req) : http("/groups", { method: "POST", body: JSON.stringify(req) }),
  remove: (id: number): Promise<{ success: true }> =>
    USE_MOCK ? mockApi.deleteGroup(id) : http(`/groups/${id}`, { method: "DELETE" }),
}

export const membershipApi = {
  getUserMemberships: (userId: number): Promise<Membership[]> =>
    USE_MOCK ? mockApi.getUserMemberships(userId) : http(`/memberships/user/${userId}`),
  getGroupRoster: (groupId: number): Promise<Membership[]> =>
    USE_MOCK ? mockApi.getGroupRoster(groupId) : http(`/memberships/group/${groupId}`),
  join: (req: JoinGroupRequest): Promise<Membership> =>
    USE_MOCK ? mockApi.joinGroup(req) : http("/memberships/join", { method: "POST", body: JSON.stringify(req) }),
  get: (membershipId: number): Promise<Membership> =>
    USE_MOCK ? mockApi.getMembership(membershipId) : http(`/memberships/${membershipId}`),
}

export const dashboardApi = {
  getSummary: (): Promise<DashboardSummary> =>
    USE_MOCK ? mockApi.getDashboardSummary() : http("/dashboard/summary"),
}

export const auctionApi = {
  getCurrent: (groupId: number): Promise<Auction | null> =>
    USE_MOCK ? mockApi.getCurrentAuction(groupId) : http(`/auctions/current/${groupId}`),
  placeBid: (groupId: number, discountPercent: number): Promise<Bid> =>
    USE_MOCK
      ? mockApi.placeBid(groupId, discountPercent)
      : http("/auctions/bid", { method: "POST", body: JSON.stringify({ groupId, discountPercent }) }),
  trigger: (groupId: number): Promise<Auction> =>
    USE_MOCK ? mockApi.triggerAuction(groupId) : http(`/auctions/${groupId}`, { method: "POST" }),
  history: (groupId: number): Promise<Auction[]> =>
    USE_MOCK ? mockApi.getAuctionHistory(groupId) : http(`/auctions/group/${groupId}`),
  upcoming: (): Promise<Auction | null> =>
    USE_MOCK ? mockApi.getUpcomingAuction() : http("/auctions/upcoming"),
}

export const transactionApi = {
  getForUser: (userId: number): Promise<Transaction[]> =>
    USE_MOCK ? mockApi.getTransactions(userId) : http(`/transactions/user/${userId}`),
  getForGroup: (groupId: number): Promise<Transaction[]> =>
    USE_MOCK ? mockApi.getGroupTransactions(groupId) : http(`/transactions/group/${groupId}`),
}

export const riskApi = {
  getReport: (membershipId: number): Promise<RiskReport> =>
    USE_MOCK ? mockApi.getRiskReport(membershipId) : http(`/risk/${membershipId}`),
  getPerformance: (membershipId: number): Promise<PerformanceReport> =>
    USE_MOCK ? mockApi.getPerformance(membershipId) : http(`/reports/performance/${membershipId}`),
}