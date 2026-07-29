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

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

function hoursFromNow(h: number) {
  return new Date(Date.now() + h * 3600 * 1000).toISOString()
}

let groups: Group[] = [
  { id: 1, groupName: "Mumbai Merchants Chit", groupSize: 12, contributionAmount: 500, riskThreshold: 65, currentCycle: 3, numberOfCycles: 12, auctionDurationMinutes: 30, groupFrequency: "MONTHLY", nextAuctionTime: hoursFromNow(0.4) },
  { id: 2, groupName: "Lagos Susu Circle", groupSize: 10, contributionAmount: 200, riskThreshold: 40, currentCycle: 5, numberOfCycles: 10, auctionDurationMinutes: 30, groupFrequency: "WEEKLY", nextAuctionTime: hoursFromNow(20) },
  { id: 3, groupName: "Manila Paluwagan", groupSize: 8, contributionAmount: 150, riskThreshold: 85, currentCycle: 1, numberOfCycles: 8, auctionDurationMinutes: 30, groupFrequency: "MONTHLY", nextAuctionTime: hoursFromNow(72) },
  { id: 4, groupName: "Guadalajara Tanda", groupSize: 15, contributionAmount: 300, riskThreshold: 55, currentCycle: 7, numberOfCycles: 15, auctionDurationMinutes: 30, groupFrequency: "MONTHLY", nextAuctionTime: hoursFromNow(120) },
  { id: 5, groupName: "Taipei Hui Society", groupSize: 6, contributionAmount: 800, riskThreshold: 30, currentCycle: 2, numberOfCycles: 6, auctionDurationMinutes: 30, groupFrequency: "MONTHLY", nextAuctionTime: hoursFromNow(200) },
]

let memberships: Membership[] = [
  { membershipId: 101, groupId: 1, username: "You", groupName: "Mumbai Merchants Chit", trustScoreAtJoining: 72, status: "ACTIVE" },
  { membershipId: 102, groupId: 2, username: "You", groupName: "Lagos Susu Circle", trustScoreAtJoining: 68, status: "POOL_RECEIVED" },
]

const rosterByGroup: Record<number, Membership[]> = {
  1: [
    { membershipId: 101, groupId: 1, username: "You", groupName: "Mumbai Merchants Chit", trustScoreAtJoining: 72, status: "ACTIVE" },
    { membershipId: 111, groupId: 1, username: "Priya Nair", groupName: "Mumbai Merchants Chit", trustScoreAtJoining: 88, status: "ACTIVE" },
    { membershipId: 112, groupId: 1, username: "Arjun Mehta", groupName: "Mumbai Merchants Chit", trustScoreAtJoining: 64, status: "POOL_RECEIVED" },
    { membershipId: 113, groupId: 1, username: "Sana Kapoor", groupName: "Mumbai Merchants Chit", trustScoreAtJoining: 91, status: "ACTIVE" },
    { membershipId: 114, groupId: 1, username: "Rohit Das", groupName: "Mumbai Merchants Chit", trustScoreAtJoining: 45, status: "RESTRICTED" },
  ],
  2: [
    { membershipId: 102, groupId: 2, username: "You", groupName: "Lagos Susu Circle", trustScoreAtJoining: 68, status: "POOL_RECEIVED" },
    { membershipId: 121, groupId: 2, username: "Chinedu Okafor", groupName: "Lagos Susu Circle", trustScoreAtJoining: 82, status: "ACTIVE" },
    { membershipId: 122, groupId: 2, username: "Amara Balogun", groupName: "Lagos Susu Circle", trustScoreAtJoining: 76, status: "ACTIVE" },
  ],
}

const auctionsByGroup: Record<number, Auction> = {
  1: {
    auctionId: 9001, groupId: 1, cycle: 4, startTime: hoursFromNow(-0.05), endTime: hoursFromNow(0.4), status: "LIVE", poolAmount: 6000,
    bids: [
      { bidId: 1, auctionId: 9001, membershipId: 111, username: "Priya Nair", discountPercent: 12, placedAt: hoursFromNow(-0.03) },
      { bidId: 2, auctionId: 9001, membershipId: 113, username: "Sana Kapoor", discountPercent: 15, placedAt: hoursFromNow(-0.02) },
      { bidId: 3, auctionId: 9001, membershipId: 112, username: "Arjun Mehta", discountPercent: 18, placedAt: hoursFromNow(-0.01) },
    ],
  },
}

let transactions: Transaction[] = [
  { id: 1, userId: 1, type: "CONTRIBUTION", amount: -500, groupName: "Mumbai Merchants Chit", description: "Cycle 3 contribution", createdAt: hoursFromNow(-24 * 3) },
  { id: 2, userId: 1, type: "DIVIDEND", amount: 42, groupName: "Mumbai Merchants Chit", description: "Cycle 2 discount dividend", createdAt: hoursFromNow(-24 * 5) },
  { id: 3, userId: 1, type: "PAYOUT", amount: 1800, groupName: "Lagos Susu Circle", description: "Won auction — pool payout", createdAt: hoursFromNow(-24 * 12) },
  { id: 4, userId: 1, type: "CONTRIBUTION", amount: -200, groupName: "Lagos Susu Circle", description: "Weekly contribution", createdAt: hoursFromNow(-24 * 15) },
  { id: 5, userId: 1, type: "DEPOSIT", amount: 2000, description: "Wallet top-up", createdAt: hoursFromNow(-24 * 30) },
  { id: 6, userId: 1, type: "FEE", amount: -12, description: "Platform fee", createdAt: hoursFromNow(-24 * 30) },
  { id: 7, userId: 1, type: "DIVIDEND", amount: 65, groupName: "Lagos Susu Circle", description: "Cycle 3 dividend", createdAt: hoursFromNow(-24 * 40) },
]

let nextGroupId = 6
let nextMembershipId = 200
let nextBidId = 100
let nextUserId = 2
let nextAuctionId = 9100

const users: AuthUser[] = [
  { token: "mock-jwt-token", userId: 1, name: "Alex Rivera", email: "alex@circl.app", accountBalance: 4820 },
  { token: "mock-jwt-token", userId: 2, name: "Priya Nair", email: "priya@circl.app", accountBalance: 2100 },
  { token: "mock-jwt-token", userId: 3, name: "Chinedu Okafor", email: "chinedu@circl.app", accountBalance: 3450 },
]

function currentUser(): AuthUser {
  return { token: "mock-jwt-token", userId: 1, name: "Alex Rivera", email: "alex@circl.app", accountBalance: 4820 }
}

export const mockApi = {
  async login(_req: LoginRequest): Promise<AuthUser> { await delay(); return currentUser() },
  async register(req: RegisterRequest): Promise<AuthUser> { await delay(); return { ...currentUser(), name: req.name, email: req.email, accountBalance: 0 } },
  async getAllGroups(): Promise<Group[]> { await delay(); return [...groups] },
  async getGroup(id: number): Promise<Group> {
    await delay(); const g = groups.find((x) => x.id === id); if (!g) throw new Error("Group not found"); return g
  },
  async createGroup(req: CreateGroupRequest): Promise<Group> {
    await delay()
    const g: Group = {
      id: nextGroupId++, groupName: req.groupName, groupSize: req.groupSize,
      contributionAmount: req.contributionAmount, riskThreshold: req.riskThreshold,
      currentCycle: 0, numberOfCycles: req.numberOfCycles, auctionDurationMinutes: 30,
      groupFrequency: req.groupFrequency, nextAuctionTime: req.firstAuctionTime,
    }
    groups = [g, ...groups]; return g
  },
  async getUserMemberships(_userId: number): Promise<Membership[]> { await delay(); return [...memberships] },
  async getGroupRoster(groupId: number): Promise<Membership[]> {
    await delay(); return rosterByGroup[groupId] ?? memberships.filter((m) => m.groupId === groupId)
  },
  async joinGroup(req: JoinGroupRequest): Promise<Membership> {
    await delay()
    const group = groups.find((g) => g.id === req.groupId)
    const m: Membership = { membershipId: nextMembershipId++, groupId: req.groupId, username: "You", groupName: group?.groupName ?? "Group", trustScoreAtJoining: 70, status: "ACTIVE" }
    if (!memberships.some((x) => x.groupId === req.groupId)) memberships = [...memberships, m]
    if (!rosterByGroup[req.groupId]?.some((x) => x.username === "You")) {
      rosterByGroup[req.groupId] = [...(rosterByGroup[req.groupId] ?? []), m]
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
  async getCurrentAuction(groupId: number): Promise<Auction | null> {
    await delay(150)
    return auctionsByGroup[groupId] ?? null
  },
  async placeBid(req: { auctionId: number; membershipId: number; bidAmount: number }): Promise<Bid> {
    await delay(200)
    // Find the group id for this auction from the mock auctionsByGroup
    const groupIdStr = Object.keys(auctionsByGroup).find(
      k => auctionsByGroup[Number(k)]?.auctionId === req.auctionId
    )
    if (!groupIdStr) throw new Error("No live auction")
    const auction = auctionsByGroup[Number(groupIdStr)]
    if (!auction) throw new Error("No live auction")
    const bid: Bid = {
      bidId: nextBidId++,
      auctionId: auction.auctionId,
      membershipId: req.membershipId,
      username: "Mock User",
      discountPercent: req.bidAmount,
      placedAt: new Date().toISOString(),
    }
    auction.bids.push(bid)
    return bid
  },
  async getTransactions(_userId: number): Promise<Transaction[]> { await delay(); return [...transactions] },
  async getRiskReport(_membershipId: number): Promise<RiskReport> {
    await delay()
    return {
      membershipId: 101, trustScore: 74, onTimeRate: 0.96, defaults: 0,
      auctionsWon: 2, totalContributed: 3400, totalReceived: 1907, band: "MEDIUM",
    }
  },
  async listUsers(): Promise<AuthUser[]> { await delay(); return [...users] },
  async getUser(id: number): Promise<AuthUser> {
    await delay()
    const u = users.find((x) => x.userId === id)
    if (!u) throw new Error("User not found")
    return u
  },
  async adminCreateUser(req: RegisterRequest): Promise<AuthUser> {
    await delay()
    nextUserId += 1
    const u: AuthUser = { token: "mock-jwt-token", userId: nextUserId, name: req.name, email: req.email, accountBalance: 0 }
    users.push(u)
    return u
  },
  async deleteUser(id: number): Promise<{ success: true }> {
    await delay()
    const idx = users.findIndex((x) => x.userId === id)
    if (idx >= 0) users.splice(idx, 1)
    return { success: true }
  },
  async deleteGroup(id: number): Promise<{ success: true }> {
    await delay()
    groups = groups.filter((g) => g.id !== id)
    return { success: true }
  },
  async getMembership(membershipId: number): Promise<Membership> {
    await delay()
    const all = [...memberships, ...Object.values(rosterByGroup).flat()]
    const m = all.find((x) => x.membershipId === membershipId)
    if (!m) throw new Error("Membership not found")
    return m
  },
  async triggerAuction(groupId: number): Promise<Auction> {
    await delay()
    const group = groups.find((g) => g.id === groupId)
    if (!group) throw new Error("Group not found")
    const auction: Auction = {
      auctionId: nextAuctionId++, groupId, cycle: group.currentCycle + 1,
      startTime: new Date().toISOString(), endTime: hoursFromNow(0.5),
      status: "LIVE", poolAmount: group.contributionAmount * group.groupSize, bids: [],
    }
    auctionsByGroup[groupId] = auction
    return auction
  },
  async getAuctionHistory(groupId: number): Promise<Auction[]> {
    await delay()
    const current = auctionsByGroup[groupId]
    const past: Auction[] = current
      ? Array.from({ length: Math.max(0, current.cycle - 1) }, (_, i) => ({
          auctionId: 8000 + i, groupId, cycle: i + 1,
          startTime: hoursFromNow(-24 * (current.cycle - i) * 7),
          endTime: hoursFromNow(-24 * (current.cycle - i) * 7 + 0.5),
          status: "SETTLED",
          poolAmount: current.poolAmount,
          bids: [],
          winningBid: { bidId: 7000 + i, auctionId: 8000 + i, membershipId: 111, username: "Priya Nair", discountPercent: 10 + i, placedAt: hoursFromNow(-24 * (current.cycle - i) * 7 + 0.4) },
        }))
      : []
    return past
  },
  async getUpcomingAuction(): Promise<Auction | null> {
    await delay()
    const live = Object.values(auctionsByGroup).find((a) => a.status === "LIVE")
    if (live) return live
    const group = groups[0]
    if (!group) return null
    return {
      auctionId: nextAuctionId, groupId: group.id, cycle: group.currentCycle + 1,
      startTime: group.nextAuctionTime, endTime: hoursFromNow(0.5), status: "SCHEDULED",
      poolAmount: group.contributionAmount * group.groupSize, bids: [],
    }
  },
  async getGroupTransactions(groupId: number): Promise<Transaction[]> {
    await delay()
    const group = groups.find((g) => g.id === groupId)
    return transactions.filter((t) => t.groupName === group?.groupName)
  },
  async getPerformance(membershipId: number): Promise<PerformanceReport> {
    await delay()
    const totalContributed = 3400
    const totalReceived = 1907
    const projectedPayout = 6000
    const netReturn = totalReceived + projectedPayout - totalContributed
    return {
      membershipId,
      totalContributed,
      totalReceived,
      netReturn,
      roiPercent: +((netReturn / totalContributed) * 100).toFixed(2),
      cyclesCompleted: 3,
      cyclesRemaining: 9,
      projectedPayout,
    }
  },
}