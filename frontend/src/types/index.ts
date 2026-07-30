export type GroupFrequency = "DAILY" | "WEEKLY" | "MONTHLY"

export type MembershipStatus =
  | "ACTIVE"
  | "POOL_RECEIVED"
  | "RESTRICTED"
  | "SUSPENDED"
  | "COMPLETED"
  | "LEFT"

export interface AuthUser {
  token: string
  userId: number
  name: string
  email: string
  accountBalance: number
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface Group {
  id: number
  groupName: string
  groupSize: number
  contributionAmount: number
  riskThreshold: number
  currentCycle: number
  numberOfCycles: number
  auctionDurationMinutes: number
  groupFrequency: GroupFrequency
  nextAuctionTime: string | null
  adminUserId?: number
}

export interface CreateGroupRequest {
  groupName: string
  groupSize: number
  contributionAmount: number
  riskThreshold: number
  numberOfCycles: number
  groupFrequency: GroupFrequency
  firstAuctionTime?: string
}

export interface StartGroupRequest {
  groupId: number
  firstAuctionTime: string
  reduceSizeIfNeeded: boolean
}

export interface Membership {
  membershipId: number
  groupId: number
  username: string
  groupName: string
  currentTrustScore?: number
  trustScoreAtJoining?: number
  status: MembershipStatus
}

export interface JoinGroupRequest {
  groupId: number
  userId: number
}

export interface DashboardSummary {
  totalSavings: number
  activeGroupsCount: number
  upcomingContribution: number
  riskScore: number
}

export interface Bid {
  bidId: number
  auctionId: number
  membershipId: number
  username: string
  discountPercent?: number
  bidAmount: number
  placedAt: string
}

export interface Auction {
  auctionId: number
  groupId: number
  cycleNumber?: number
  cycle?: number // backend uses cycleNumber, mock might use cycle
  startTime: string
  endTime: string
  status?: string
  auctionStatus?: "OPEN" | "CLOSED" | "PENDING"
  bids: Bid[]
  poolAmount: number
  winnerName?: string
  winningDiscountBid?: number
}

export type TransactionType =
  | "CONTRIBUTION"
  | "ALLOCATION"
  | "PAYOUT"
  | "DIVIDEND"
  | "PENALTY"
  | "RECOVERY"
  | "DEPOSIT"
  | "WITHDRAWAL"
  | "FEE"

export interface Transaction {
  id: number
  userId?: number
  type?: TransactionType
  transactionType?: TransactionType
  amount: number
  groupName?: string
  description?: string
  createdAt: string
}

export interface RiskReport {
  membershipId: number
  trustScore: number
  onTimeRate: number
  defaults: number
  auctionsWon: number
  totalContributed: number
  totalReceived: number
  band: "LOW" | "MEDIUM" | "HIGH"
}

export interface PerformanceReport {
  membershipId: number
  totalContributed: number
  totalReceived: number
  netReturn: number
  roiPercent: number
  cyclesCompleted: number
  cyclesRemaining: number
  projectedPayout: number
}