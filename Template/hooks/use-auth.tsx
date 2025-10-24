"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

export interface User {
  id: string
  username: string
  email: string
  display_name: string | null
  wallet_address: string | null
  wallet_connected_at: Date | null
  email_verified: boolean
  last_login: Date | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (username: string, email: string, password: string, displayName?: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  connectWallet: (walletAddress: string) => Promise<{ success: boolean; error?: string }>
  disconnectWallet: () => Promise<{ success: boolean; error?: string }>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Fetch current user on mount
  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error fetching current user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Sign in failed' }
      }
    } catch (error) {
      console.error('Sign in error:', error)
      return { success: false, error: 'An error occurred during sign in' }
    }
  }

  const signUp = async (username: string, email: string, password: string, displayName?: string) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, displayName }),
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Sign up failed' }
      }
    } catch (error) {
      console.error('Sign up error:', error)
      return { success: false, error: 'An error occurred during sign up' }
    }
  }

  const signOut = async () => {
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      })
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const connectWallet = async (walletAddress: string) => {
    try {
      const response = await fetch('/api/auth/wallet/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress }),
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Failed to connect wallet' }
      }
    } catch (error) {
      console.error('Connect wallet error:', error)
      return { success: false, error: 'An error occurred while connecting wallet' }
    }
  }

  const disconnectWallet = async () => {
    try {
      const response = await fetch('/api/auth/wallet/disconnect', {
        method: 'POST',
        credentials: 'include',
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        return { success: true }
      } else {
        return { success: false, error: data.error || 'Failed to disconnect wallet' }
      }
    } catch (error) {
      console.error('Disconnect wallet error:', error)
      return { success: false, error: 'An error occurred while disconnecting wallet' }
    }
  }

  const refreshUser = async () => {
    await fetchCurrentUser()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        connectWallet,
        disconnectWallet,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

