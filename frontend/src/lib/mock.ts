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

// ---------------------------------------------------------------------------
// In-memory mock backend. Used when VITE_API_BASE_URL is not configured so the
// entire app is demonstrable in preview without the Spring backend running.
// ---------------------------------------------------------------------------

const delay = (ms = 450) => new Promise((r) => setTimeout(r, ms))

function hoursFromNow(h: number) {
  return new Date(Date.now() + h * 3600 * 1000).toISOString()
}

let groups: Group[] = [
  {
    id: 1,
    groupName: "Mumbai Merchants Chit",
    groupSize: 12,
    contributionAmount: 500,
    riskThreshold: 65,
    currentCycle: 3,
    numberOfCycles: 12,
    auctionDurationMinutes: 30,
    groupFrequency: "MONTHLY",
    nextAuctionTime: hoursFromNow(0.4),
  },
  {
    id: 2,
    groupName: "Lagos Susu Circle",
    groupSize: 10,
    contributionAmount: 200,
    riskThreshold: 40,
    currentCycle: 5,
    numberOfCycles: 10,
    auctionDurationMinutes: 30,
    groupFrequency: "WEEKLY",
    nextAuctionTime: hoursFromNow(20),
  },
  {
    id: 3,
    groupName: "Manila Paluwagan",
    groupSize: 8,
    contributionAmount: 150,
    riskThreshold: 85,
    currentCycle: 1,
    numberOfCycles: 8,
    auctionDurationMinutes: 30,
    groupFrequency: "MONTHLY",
    nextAuctionTime: hoursFromNow(72),
  },
  {
    id: 4,
    groupName: "Guadalajara Tanda",
    groupSize: 15,
    contributionAmount: 300,
    riskThreshold: 55,
    currentCycle: 7,
    numberOfCycles: 15,
    auctionDurationMinutes: 30,
    groupFrequency: "MONTHLY",
    nextAuctionTime: hoursFromNow(120),
  },
  {
    id: 5,
    groupName: "Taipei Hui Society",
    groupSize: 6,
    contributionAmount: 800,
    riskThreshold: 30,
    currentCycle: 2,
    numberOfCycles: 6,
    auctionDurationMinutes: 30,
    groupFrequency: "MONTHLY",
    nextAuctionTime: hoursFromNow(200),
  },
]

let memberships: Membership[] = [
  {
    membershipId: 101,
    groupId: 1,
    username: "You",
    groupName: "Mumbai Merchants Chit",
    trustScoreAtJoining: 72,
    status: "ACTIVE",
  },
  {
    membershipId: 102,
    groupId: 2,
    username: "You",
    groupName: "Lagos Susu Circle",
    trustScoreAtJoining: 68,
    status: "POOL_RECEIVED",
  },
]

// Extra members shown on the group detail table.
const rosterByGroup: Record<number, Membership[]> = {
  1: [
    { membershipId: 101, groupId: 1, username: "You", groupName: "Mumbai Merchants Chit", trustScoreAtJoining: 72, status: "ACTIVE" },
    { membershipId: 111, groupId: 1, username: "Priya Nair", groupName: "Mumbai Merchants Chit", trustScoreAtJoining: 88, status: "ACTIVE" },
    { membershipId: 112, groupId: 1, username: "Arjun Mehta", groupName: "Mumbai Merchants Chit", trustScoreAtJoining: 64, status: "POOL_RECEIVED" },
    { membershipId: 113, groupId: 1, username: "Sana Kapoor", groupName: "Mumbai Merchants Chit", trustScoreAtJoining: 91, status: "ACTIVE" },
    { membershipId: 114, groupId: 1, username: "Rohit Das", groupName: "Mumbai Merchants Chit", trustScoreAtJoining: 45, status: "RESTRICTED" },
  ],
}

let nextGroupId = 6
let nextMembershipId = 200

function currentUser(): AuthUser {
  return {
    token: "mock-jwt-token",
    userId: 1,
    name: "Alex Rivera",
    email: "alex@circl.app",
    accountBalance: 4820,
  }
}

export const mockApi = {
  async login(_req: LoginRequest): Promise<AuthUser> {
    await delay()
    return currentUser()
  },
  async register(req: RegisterRequest): Promise<AuthUser> {
    await delay()
    return { ...currentUser(), name: req.name, email: req.email, accountBalance: 0 }
  },
  async getAllGroups(): Promise<Group[]> {
    await delay()
    return [...groups]
  },
  async getGroup(id: number): Promise<Group> {
    await delay()
    const g = groups.find((x) => x.id === id)
    if (!g) throw new Error("Group not found")
    return g
  },
  async createGroup(req: CreateGroupRequest): Promise<Group> {
    await delay()
    const g: Group = {
      id: nextGroupId++,
      groupName: req.groupName,
      groupSize: req.groupSize,
      contributionAmount: req.contributionAmount,
      riskThreshold: req.riskThreshold,
      currentCycle: 0,
      numberOfCycles: req.numberOfCycles,
      auctionDurationMinutes: 30,
      groupFrequency: req.groupFrequency,
      nextAuctionTime: req.firstAuctionTime,
    }
    groups = [g, ...groups]
    return g
  },
  async getUserMemberships(_userId: number): Promise<Membership[]> {
    await delay()
    return [...memberships]
  },
  async getGroupRoster(groupId: number): Promise<Membership[]> {
    await delay()
    return rosterByGroup[groupId] ?? memberships.filter((m) => m.groupId === groupId)
  },
  async joinGroup(req: JoinGroupRequest): Promise<Membership> {
    await delay()
    const group = groups.find((g) => g.id === req.groupId)
    const m: Membership = {
      membershipId: nextMembershipId++,
      groupId: req.groupId,
      username: "You",
      groupName: group?.groupName ?? "Group",
      trustScoreAtJoining: 70,
      status: "ACTIVE",
    }
    if (!memberships.some((x) => x.groupId === req.groupId)) {
      memberships = [...memberships, m]
    }
    return m
  },
  async getDashboardSummary(): Promise<DashboardSummary> {
    await delay()
    return {
      totalSavings: 4820,
      activeGroupsCount: memberships.filter((m) => m.status === "ACTIVE" || m.status === "POOL_RECEIVED").length,
      upcomingContribution: 700,
      riskScore: 74,
    }
  },
}
