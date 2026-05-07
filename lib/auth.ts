import { createClient } from "@/utils/supabase/client"

export interface User {
  id: string
  numericId: number
  email: string
  name: string
  role: "user" | "admin"
  walletAddress: string
  wallets?: {
    trx?: string
    sol?: string
    bsc?: string
  }
  balance: number
  bonusBalance: number
  createdAt: string
  status?: "active" | "suspended"
  referralCode?: string
  referredBy?: string
  referralCount?: number
  hasAcceptedTerms?: boolean
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

const CACHE_KEY = "drixx_auth_cache"
const LEGACY_USERS_KEY = "usdt_lottery_users"

interface ProfileRow {
  id: string
  numeric_id: number
  name: string
  wallet_address: string
  balance: number | string
  bonus_balance: number | string
  referral_code: string
  referred_by: string | null
  referral_count: number
  status: "active" | "suspended"
  created_at: string
}

function mapProfile(row: ProfileRow, email: string): User {
  return {
    id: row.id,
    numericId: Number(row.numeric_id),
    email,
    name: row.name,
    role: row.name === "Admin" ? "admin" : "user",
    walletAddress: row.wallet_address,
    wallets: { bsc: row.wallet_address },
    balance: Number(row.balance),
    bonusBalance: Number(row.bonus_balance),
    createdAt: row.created_at,
    status: row.status,
    referralCode: row.referral_code,
    referredBy: row.referred_by ?? undefined,
    referralCount: row.referral_count,
  }
}

export async function fetchCurrentUser(): Promise<User | null> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session?.user) return null

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(
      "id,numeric_id,name,wallet_address,balance,bonus_balance,referral_code,referred_by,referral_count,status,created_at",
    )
    .eq("id", session.user.id)
    .maybeSingle()

  if (error || !profile) return null
  return mapProfile(profile as unknown as ProfileRow, session.user.email ?? "")
}

export async function login(email: string, password: string): Promise<User> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  if (!data.session) throw new Error("Sign-in failed: no session returned")

  const user = await fetchCurrentUser()
  if (!user) {
    throw new Error(
      "Signed in, but profile is missing. Run the SQL migrations in scripts/ on your Supabase project.",
    )
  }
  return user
}

export async function register(
  email: string,
  password: string,
  name: string,
): Promise<{ user: User | null; needsEmailConfirmation: boolean }> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  })
  if (error) throw new Error(error.message)

  if (!data.session) {
    return { user: null, needsEmailConfirmation: true }
  }

  const user = await fetchCurrentUser()
  return { user, needsEmailConfirmation: false }
}

export async function logout(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
  if (typeof window !== "undefined") {
    localStorage.removeItem(CACHE_KEY)
  }
}

export async function requestPasswordReset(email: string): Promise<void> {
  const supabase = createClient()
  const redirectTo =
    typeof window !== "undefined" ? `${window.location.origin}/login` : undefined
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
  if (error) throw new Error(error.message)
}

// ---------------------------------------------------------------------------
// Local-state mirror used by the cached AuthProvider.
// ---------------------------------------------------------------------------

export function getStoredAuth(): AuthState {
  if (typeof window === "undefined") return { user: null, isAuthenticated: false }
  const raw = localStorage.getItem(CACHE_KEY)
  if (!raw) return { user: null, isAuthenticated: false }
  try {
    return JSON.parse(raw) as AuthState
  } catch {
    return { user: null, isAuthenticated: false }
  }
}

export function setStoredAuth(auth: AuthState): void {
  if (typeof window === "undefined") return
  localStorage.setItem(CACHE_KEY, JSON.stringify(auth))
}

// ---------------------------------------------------------------------------
// Legacy synchronous helpers (still used by lottery/wallet/admin pages that
// haven't been migrated to Supabase yet). They operate on a localStorage
// mirror so the rest of the app keeps working while the migration proceeds.
// TODO: replace each call site with Supabase queries, then delete this section.
// ---------------------------------------------------------------------------

function readLegacyUsers(): User[] {
  if (typeof window === "undefined") return []
  const raw = localStorage.getItem(LEGACY_USERS_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as User[]
  } catch {
    return []
  }
}

function writeLegacyUsers(users: User[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(LEGACY_USERS_KEY, JSON.stringify(users))
}

export function getAllUsers(): User[] {
  const cache = getStoredAuth()
  const users = readLegacyUsers()
  if (cache.user && !users.find((u) => u.id === cache.user!.id)) {
    users.push(cache.user)
    writeLegacyUsers(users)
  }
  return users
}

export function updateUserBalance(userId: string, newBalance: number): void {
  const users = readLegacyUsers()
  const idx = users.findIndex((u) => u.id === userId)
  if (idx !== -1) {
    users[idx].balance = newBalance
    writeLegacyUsers(users)
  }
  const auth = getStoredAuth()
  if (auth.user?.id === userId) {
    auth.user.balance = newBalance
    setStoredAuth(auth)
  }
  if (typeof window !== "undefined") {
    const event = new CustomEvent("storage-sync", {
      detail: { key: LEGACY_USERS_KEY, value: users },
    })
    window.dispatchEvent(event)
  }
  // Fire-and-forget Supabase write so the DB stays in sync.
  void (async () => {
    try {
      const supabase = createClient()
      await supabase.from("profiles").update({ balance: newBalance }).eq("id", userId)
    } catch {
      /* ignore — surface errors only when we fully migrate this call site */
    }
  })()
}

export function updateUserBonusBalance(userId: string, newBonusBalance: number): void {
  const users = readLegacyUsers()
  const idx = users.findIndex((u) => u.id === userId)
  if (idx !== -1) {
    users[idx].bonusBalance = newBonusBalance
    writeLegacyUsers(users)
  }
  const auth = getStoredAuth()
  if (auth.user?.id === userId) {
    auth.user.bonusBalance = newBonusBalance
    setStoredAuth(auth)
  }
  void (async () => {
    try {
      const supabase = createClient()
      await supabase.from("profiles").update({ bonus_balance: newBonusBalance }).eq("id", userId)
    } catch {
      /* ignore */
    }
  })()
}
