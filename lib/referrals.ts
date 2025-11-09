import { triggerSync } from "./sync"
import { getAllUsers, updateUserBalance } from "./auth"

export interface Referral {
  id: string
  referrerId: string // User who referred
  referredId: string // User who was referred
  referralCode: string
  status: "pending" | "completed"
  reward: number
  commissionEarned: number // Track commission earnings from referred user's purchases
  createdAt: Date
  completedAt?: Date
}

export interface ReferralStats {
  totalReferrals: number
  completedReferrals: number
  pendingReferrals: number
  totalEarned: number
  commissionEarned: number // Total commission from referred users
  referralCode: string
}

export interface ReferralSettings {
  signupReward: number // USDT reward per completed referral
  commissionRate: number // % commission on referred user's purchases (0-100)
}

const REFERRALS_KEY = "usdt_lottery_referrals"
const REFERRAL_SETTINGS_KEY = "usdt_lottery_referral_settings"

export const getReferralSettings = (): ReferralSettings => {
  if (typeof window === "undefined") {
    return { signupReward: 5, commissionRate: 10 }
  }

  const stored = localStorage.getItem(REFERRAL_SETTINGS_KEY)
  if (!stored) {
    const defaultSettings: ReferralSettings = {
      signupReward: 5,
      commissionRate: 10,
    }
    localStorage.setItem(REFERRAL_SETTINGS_KEY, JSON.stringify(defaultSettings))
    return defaultSettings
  }

  return JSON.parse(stored)
}

export const updateReferralSettings = (settings: ReferralSettings): void => {
  if (typeof window === "undefined") return

  localStorage.setItem(REFERRAL_SETTINGS_KEY, JSON.stringify(settings))
  triggerSync("referral-settings")
}

// Generate unique referral code for user
export const generateReferralCode = (userId: string): string => {
  const code = userId.substring(0, 4) + Math.random().toString(36).substring(2, 8).toUpperCase()
  return code
}

// Get user's referral code
export const getUserReferralCode = (userId: string): string => {
  if (typeof window === "undefined") return ""

  const users = getAllUsers()
  const user = users.find((u: any) => u.id === userId)

  return user?.referralCode || ""
}

// Validate referral code
export const validateReferralCode = (code: string): string | null => {
  if (typeof window === "undefined") return null
  if (!code) return null

  const users = getAllUsers()
  const user = users.find((u: any) => u.referralCode === code)

  return user ? user.id : null
}

// Create referral when new user registers with code
export const createReferral = (referrerId: string, referredId: string, referralCode: string): void => {
  if (typeof window === "undefined") return

  const referralsData = localStorage.getItem(REFERRALS_KEY)
  const referrals: Referral[] = referralsData ? JSON.parse(referralsData) : []

  const settings = getReferralSettings()

  const newReferral: Referral = {
    id: "ref-" + Date.now() + "-" + Math.random().toString(36).substring(2, 9),
    referrerId,
    referredId,
    referralCode,
    status: "pending",
    reward: settings.signupReward,
    commissionEarned: 0, // Initialize commission earnings
    createdAt: new Date(),
  }

  referrals.push(newReferral)
  localStorage.setItem(REFERRALS_KEY, JSON.stringify(referrals))
  triggerSync("referrals")
}

// Complete referral (when referred user makes first deposit)
export const completeReferral = (referredId: string): void => {
  if (typeof window === "undefined") return

  const referralsData = localStorage.getItem(REFERRALS_KEY)
  const referrals: Referral[] = referralsData ? JSON.parse(referralsData) : []

  const referralIndex = referrals.findIndex((r) => r.referredId === referredId && r.status === "pending")

  if (referralIndex !== -1) {
    referrals[referralIndex].status = "completed"
    referrals[referralIndex].completedAt = new Date()

    localStorage.setItem(REFERRALS_KEY, JSON.stringify(referrals))

    // Add reward to referrer's balance
    const users = getAllUsers()
    const referrer = users.find((u: any) => u.id === referrals[referralIndex].referrerId)

    if (referrer) {
      updateUserBalance(referrer.id, referrer.balance + referrals[referralIndex].reward)
    }

    triggerSync("referrals")
  }
}

export const addReferralCommission = (userId: string, purchaseAmount: number): void => {
  if (typeof window === "undefined") return

  const referralsData = localStorage.getItem(REFERRALS_KEY)
  const referrals: Referral[] = referralsData ? JSON.parse(referralsData) : []

  // Find if this user was referred by someone
  const referral = referrals.find((r) => r.referredId === userId && r.status === "completed")

  if (referral) {
    const settings = getReferralSettings()
    const commission = (purchaseAmount * settings.commissionRate) / 100

    // Update commission earned
    referral.commissionEarned += commission

    localStorage.setItem(REFERRALS_KEY, JSON.stringify(referrals))

    // Add commission to referrer's balance
    const users = getAllUsers()
    const referrer = users.find((u: any) => u.id === referral.referrerId)

    if (referrer) {
      updateUserBalance(referrer.id, referrer.balance + commission)
    }

    triggerSync("referrals")
  }
}

// Get user's referral stats
export const getReferralStats = (userId: string): ReferralStats => {
  if (typeof window === "undefined") {
    return {
      totalReferrals: 0,
      completedReferrals: 0,
      pendingReferrals: 0,
      totalEarned: 0,
      commissionEarned: 0,
      referralCode: "",
    }
  }

  const referralsData = localStorage.getItem(REFERRALS_KEY)
  const referrals: Referral[] = referralsData ? JSON.parse(referralsData) : []

  const userReferrals = referrals.filter((r) => r.referrerId === userId)
  const completed = userReferrals.filter((r) => r.status === "completed")
  const pending = userReferrals.filter((r) => r.status === "pending")

  const signupRewards = completed.reduce((sum, r) => sum + r.reward, 0)
  const commissionEarnings = userReferrals.reduce((sum, r) => sum + r.commissionEarned, 0)

  return {
    totalReferrals: userReferrals.length,
    completedReferrals: completed.length,
    pendingReferrals: pending.length,
    totalEarned: signupRewards + commissionEarnings,
    commissionEarned: commissionEarnings,
    referralCode: getUserReferralCode(userId),
  }
}

// Get user's referrals list
export const getUserReferrals = (userId: string): Referral[] => {
  if (typeof window === "undefined") return []

  const referralsData = localStorage.getItem(REFERRALS_KEY)
  const referrals: Referral[] = referralsData ? JSON.parse(referralsData) : []

  return referrals
    .filter((r) => r.referrerId === userId)
    .map((r) => ({
      ...r,
      createdAt: new Date(r.createdAt),
      completedAt: r.completedAt ? new Date(r.completedAt) : undefined,
    }))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

// Get all referrals (admin)
export const getAllReferrals = (): Referral[] => {
  if (typeof window === "undefined") return []

  const referralsData = localStorage.getItem(REFERRALS_KEY)
  const referrals: Referral[] = referralsData ? JSON.parse(referralsData) : []

  return referrals.map((r) => ({
    ...r,
    createdAt: new Date(r.createdAt),
    completedAt: r.completedAt ? new Date(r.completedAt) : undefined,
  }))
}

// Get referral stats for admin
export const getAdminReferralStats = () => {
  if (typeof window === "undefined") {
    return {
      totalReferrals: 0,
      completedReferrals: 0,
      pendingReferrals: 0,
      totalRewardsPaid: 0,
      totalCommissionPaid: 0,
    }
  }

  const referralsData = localStorage.getItem(REFERRALS_KEY)
  const referrals: Referral[] = referralsData ? JSON.parse(referralsData) : []

  const completed = referrals.filter((r) => r.status === "completed")
  const pending = referrals.filter((r) => r.status === "pending")

  return {
    totalReferrals: referrals.length,
    completedReferrals: completed.length,
    pendingReferrals: pending.length,
    totalRewardsPaid: completed.reduce((sum, r) => sum + r.reward, 0),
    totalCommissionPaid: referrals.reduce((sum, r) => sum + r.commissionEarned, 0),
  }
}
