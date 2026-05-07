"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { type User, fetchCurrentUser, getStoredAuth, setStoredAuth } from "@/lib/auth"
import { createClient } from "@/utils/supabase/client"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  setAuth: (user: User | null) => void
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mounted, setMounted] = useState(false)

  const applyUser = (next: User | null) => {
    setUser(next)
    setIsAuthenticated(!!next)
    setStoredAuth({ user: next, isAuthenticated: !!next })
  }

  useEffect(() => {
    const cached = getStoredAuth()
    if (cached.user) {
      setUser(cached.user)
      setIsAuthenticated(true)
    }
    setMounted(true)

    fetchCurrentUser()
      .then((u) => applyUser(u))
      .catch(() => applyUser(null))

    const supabase = createClient()
    const { data: subscription } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        applyUser(null)
        return
      }
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "USER_UPDATED") {
        fetchCurrentUser()
          .then((u) => applyUser(u))
          .catch(() => applyUser(null))
      }
    })

    return () => {
      subscription.subscription.unsubscribe()
    }
  }, [])

  const setAuth = (newUser: User | null) => applyUser(newUser)

  const refreshAuth = async () => {
    const u = await fetchCurrentUser()
    applyUser(u)
  }

  if (!mounted) {
    return null
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, setAuth, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
