// TypeScript interfaces mapped directly to backend DTOs

export type GroupFrequency = "DAILY" | "WEEKLY" | "MONTHLY"

export type MembershipStatus =
  | "ACTIVE"
  | "POOL_RECEIVED"
  | "RESTRICTED"
  | "SUSPENDED"
  | "COMPLETED"
  | "LEFT"

// AuthenticationResponseDTO
export interface AuthUser {
  token: string
  userId: number
  name: string
  email: string
  accountBalance: number
}

// RegisterRequestDTO
export interface RegisterRequest {
  name: string
  email: string
  password: string
}

// AuthenticationRequestDTO
export interface LoginRequest {
  email: string
  password: string
}

// GroupResponseDTO
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
  nextAuctionTime: string
}

// CreateGroupRequestDTO
export interface CreateGroupRequest {
  groupName: string
  groupSize: number
  contributionAmount: number
  riskThreshold: number
  firstAuctionTime: string
  numberOfCycles: number
  groupFrequency: GroupFrequency
}

// MembershipResponseDTO
export interface Membership {
  membershipId: number
  groupId: number
  username: string
  groupName: string
  trustScoreAtJoining: number
  status: MembershipStatus
}

// JoinGroupRequestDTO
export interface JoinGroupRequest {
  userId: number
  groupId: number
}

// DashboardSummaryDTO
export interface DashboardSummary {
  totalSavings: number
  activeGroupsCount: number
  upcomingContribution: number
  riskScore: number
}
