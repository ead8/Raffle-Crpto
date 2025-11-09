"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { type User, getStoredAuth, setStoredAuth } from "@/lib/auth"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  setAuth: (user: User | null) => void
  refreshAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const auth = getStoredAuth()
    setUser(auth.user)
    setIsAuthenticated(auth.isAuthenticated)
  }, [])

  const setAuth = (newUser: User | null) => {
    setUser(newUser)
    setIsAuthenticated(!!newUser)
    setStoredAuth({ user: newUser, isAuthenticated: !!newUser })
  }

  const refreshAuth = () => {
    const auth = getStoredAuth()
    setUser(auth.user)
    setIsAuthenticated(auth.isAuthenticated)
  }

  if (!mounted) {
    return null
  }

  return <AuthContext.Provider value={{ user, isAuthenticated, setAuth, refreshAuth }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
