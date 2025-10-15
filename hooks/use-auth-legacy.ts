"use client"

import { useState, useEffect } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import type { User } from "@/lib/types"

export function useAuthLegacy() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { publicKey, connected, disconnect } = useWallet()

  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem("gossiper_user")
        if (userData) {
          const parsedUser = JSON.parse(userData)
          if (parsedUser.walletAddress && connected && publicKey) {
            parsedUser.walletConnected = true
            parsedUser.walletAddress = publicKey.toString()
          } else if (!connected) {
            parsedUser.walletConnected = false
          }
          setUser(parsedUser)
        }
      } catch (error) {
        console.error("Error parsing user data:", error)
        localStorage.removeItem("gossiper_user")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [connected, publicKey])

  const login = (userData: User) => {
    const enhancedUser = {
      ...userData,
      walletConnected: connected,
      walletAddress: publicKey?.toString() || userData.walletAddress,
      loginTimestamp: new Date().toISOString(),
      // Ensure role is set, default to 'student' if not provided
      role: userData.role || 'student',
    }
    localStorage.setItem("gossiper_user", JSON.stringify(enhancedUser))
    setUser(enhancedUser)
  }

  const logout = async () => {
    if (connected) {
      try {
        await disconnect()
      } catch (error) {
        console.error("Error disconnecting wallet:", error)
      }
    }
    localStorage.removeItem("gossiper_user")
    setUser(null)
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = {
        ...user,
        ...updates,
        walletConnected: connected,
        walletAddress: publicKey?.toString() || user.walletAddress,
      }
      localStorage.setItem("gossiper_user", JSON.stringify(updatedUser))
      setUser(updatedUser)
    }
  }

  // Temporary function for testing - set user role
  const setUserRole = (role: "student" | "lecturer" | "admin") => {
    if (user) {
      updateUser({ role })
    } else {
      // Create a mock user for testing
      const mockUser: User = {
        id: "test-user",
        email: "test@example.com",
        full_name: "Test User",
        role: role,
        preferredLanguage: "en",
        walletConnected: false,
      }
      login(mockUser)
    }
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    setUserRole, // Add this for testing
  }
}
