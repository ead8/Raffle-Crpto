export interface User {
  id: string
  numericId: number
  email: string
  name: string
  role: "user" | "admin"
  walletAddress: string // Legacy field, kept for backward compatibility
  wallets?: {
    trx?: string // TRON (TRC-20) address
    sol?: string // Solana address
    bsc?: string // BSC (BEP-20) address
  }
  balance: number
  bonusBalance: number
  createdAt: string
  status?: "active" | "suspended"
  referralCode?: string
  referredBy?: string
  referralCount?: number
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

const STORAGE_KEY = "usdt_lottery_auth"
const USERS_KEY = "usdt_lottery_users"

// Generate wallet address for different networks
const generateTRXAddress = (): string => {
  // TRON addresses start with T and are 34 characters
  return "T" + Array.from({ length: 33 }, () => "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.floor(Math.random() * 33)]).join("")
}

const generateSOLAddress = (): string => {
  // Solana addresses are base58 encoded, typically 32-44 characters
  const chars = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
  return Array.from({ length: 44 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

const generateBSCAddress = (): string => {
  // BSC addresses are Ethereum-compatible (0x + 40 hex chars)
  return "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
}

// Initialize with demo users
const initializeUsers = () => {
  if (typeof window === "undefined") return

  const existingUsers = localStorage.getItem(USERS_KEY)
  if (!existingUsers) {
    const adminWallets = {
      trx: generateTRXAddress(),
      sol: generateSOLAddress(),
      bsc: generateBSCAddress(),
    }
    const userWallets = {
      trx: generateTRXAddress(),
      sol: generateSOLAddress(),
      bsc: generateBSCAddress(),
    }

    const demoUsers: User[] = [
      {
        id: "admin-1",
        numericId: 100001,
        email: "admin@usdtlottery.com",
        name: "Admin",
        role: "admin",
        walletAddress: adminWallets.bsc, // Legacy field
        wallets: adminWallets,
        balance: 10000,
        bonusBalance: 0,
        createdAt: new Date().toISOString(),
        referralCode: "ADMIN" + Math.random().toString(36).substring(2, 6).toUpperCase(),
        referralCount: 0,
      },
      {
        id: "user-1",
        numericId: 100002,
        email: "user@example.com",
        name: "Demo User",
        role: "user",
        walletAddress: userWallets.bsc, // Legacy field
        wallets: userWallets,
        balance: 500,
        bonusBalance: 0,
        createdAt: new Date().toISOString(),
        referralCode: "USER" + Math.random().toString(36).substring(2, 6).toUpperCase(),
        referralCount: 0,
      },
    ]
    localStorage.setItem(USERS_KEY, JSON.stringify(demoUsers))
  } else {
    const users: User[] = JSON.parse(existingUsers)
    let updated = false
    users.forEach((user, index) => {
      if (!user.referralCode) {
        user.referralCode =
          user.id.substring(0, 4).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase()
        updated = true
      }
      if (!user.numericId) {
        user.numericId = 100001 + index
        updated = true
      }
      if (user.referralCount === undefined) {
        user.referralCount = 0
        updated = true
      }
      // Migrate existing users to have multi-network wallets
      if (!user.wallets) {
        user.wallets = {
          trx: generateTRXAddress(),
          sol: generateSOLAddress(),
          bsc: user.walletAddress || generateBSCAddress(), // Use existing or generate new
        }
        // Ensure walletAddress is set if missing
        if (!user.walletAddress) {
          user.walletAddress = user.wallets.bsc
        }
        updated = true
      }
    })
    if (updated) {
      localStorage.setItem(USERS_KEY, JSON.stringify(users))
    }
  }
}

export const getStoredAuth = (): AuthState => {
  if (typeof window === "undefined") {
    return { user: null, isAuthenticated: false }
  }

  initializeUsers()

  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    return JSON.parse(stored)
  }
  return { user: null, isAuthenticated: false }
}

export const setStoredAuth = (auth: AuthState) => {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth))
}

export const login = (email: string, password: string): User | null => {
  if (typeof window === "undefined") return null

  const usersData = localStorage.getItem(USERS_KEY)
  if (!usersData) return null

  const users: User[] = JSON.parse(usersData)
  const user = users.find((u) => u.email === email)

  if (user) {
    setStoredAuth({ user, isAuthenticated: true })
    return user
  }

  return null
}

export const register = (email: string, password: string, name: string): User => {
  if (typeof window === "undefined") throw new Error("Cannot register on server")

  const usersData = localStorage.getItem(USERS_KEY)
  const users: User[] = usersData ? JSON.parse(usersData) : []

  const referralCode = "REF" + Math.random().toString(36).substring(2, 8).toUpperCase()
  const numericId = 100001 + users.length

  // Generate unique wallet addresses for each network
  const wallets = {
    trx: generateTRXAddress(),
    sol: generateSOLAddress(),
    bsc: generateBSCAddress(),
  }

  // Use BSC address as default for backward compatibility
  const defaultWalletAddress = wallets.bsc

  const newUser: User = {
    id: "user-" + Date.now(),
    numericId,
    email,
    name,
    role: "user",
    walletAddress: defaultWalletAddress, // Legacy field
    wallets, // New multi-network wallets
    balance: 100,
    bonusBalance: 0,
    createdAt: new Date().toISOString(),
    referralCode,
    referralCount: 0,
  }

  users.push(newUser)
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
  setStoredAuth({ user: newUser, isAuthenticated: true })

  return newUser
}

export const logout = () => {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}

export const updateUserBalance = (userId: string, newBalance: number) => {
  if (typeof window === "undefined") return

  const usersData = localStorage.getItem(USERS_KEY)
  if (!usersData) return

  const users: User[] = JSON.parse(usersData)
  const userIndex = users.findIndex((u) => u.id === userId)

  if (userIndex !== -1) {
    users[userIndex].balance = newBalance
    localStorage.setItem(USERS_KEY, JSON.stringify(users))

    // Update auth state if this is the current user
    const auth = getStoredAuth()
    if (auth.user?.id === userId) {
      auth.user.balance = newBalance
      setStoredAuth(auth)
    }

    // Trigger sync event
    const event = new CustomEvent("storage-sync", {
      detail: { key: USERS_KEY, value: users },
    })
    window.dispatchEvent(event)
  }
}

export const updateUserBonusBalance = (userId: string, newBonusBalance: number) => {
  if (typeof window === "undefined") return

  const usersData = localStorage.getItem(USERS_KEY)
  if (!usersData) return

  const users: User[] = JSON.parse(usersData)
  const userIndex = users.findIndex((u) => u.id === userId)

  if (userIndex !== -1) {
    users[userIndex].bonusBalance = newBonusBalance
    localStorage.setItem(USERS_KEY, JSON.stringify(users))

    const auth = getStoredAuth()
    if (auth.user?.id === userId) {
      auth.user.bonusBalance = newBonusBalance
      setStoredAuth(auth)
    }
  }
}

export const getAllUsers = (): User[] => {
  if (typeof window === "undefined") return []

  initializeUsers()
  const usersData = localStorage.getItem(USERS_KEY)
  if (!usersData) return []

  return JSON.parse(usersData)
}

export const generatePasswordResetCode = (email: string): string | null => {
  if (typeof window === "undefined") return null

  const users = getAllUsers()
  const user = users.find((u) => u.email === email)

  if (!user) return null

  const code = Math.floor(100000 + Math.random() * 900000).toString()

  const resetData = {
    email,
    code,
    expiresAt: Date.now() + 15 * 60 * 1000,
  }

  localStorage.setItem("password_reset_" + email, JSON.stringify(resetData))

  return code
}

export const verifyPasswordResetCode = (email: string, code: string): boolean => {
  if (typeof window === "undefined") return false

  const resetDataStr = localStorage.getItem("password_reset_" + email)
  if (!resetDataStr) return false

  const resetData = JSON.parse(resetDataStr)

  if (resetData.code === code && resetData.expiresAt > Date.now()) {
    return true
  }

  return false
}

export const resetPassword = (email: string, code: string, newPassword: string): boolean => {
  if (typeof window === "undefined") return false

  if (!verifyPasswordResetCode(email, code)) {
    return false
  }

  const usersData = localStorage.getItem(USERS_KEY)
  if (!usersData) return false

  const users: User[] = JSON.parse(usersData)
  const userIndex = users.findIndex((u) => u.email === email)

  if (userIndex === -1) return false

  localStorage.removeItem("password_reset_" + email)

  return true
}
