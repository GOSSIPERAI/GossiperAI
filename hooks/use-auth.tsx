'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface User {
  id: string
  email?: string
  full_name: string
  role: string
  wallet_address?: string | null
  wallet_connected: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signUp: (email: string, password: string, userData: { name: string; role: 'student' | 'lecturer' }) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  signInWithWallet: (walletAddress: string) => Promise<{ error: any; isNewUser?: boolean }>
  signUpWithWallet: (walletAddress: string, userData: { name: string; role: 'student' | 'lecturer' }) => Promise<{ error: any }>
  updateProfile: (updates: { name?: string; role?: string }) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  signInWithWallet: async () => ({ error: null }),
  signUpWithWallet: async () => ({ error: null }),
  updateProfile: async () => ({ error: null }),
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    checkAuthStatus()
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 [SUPABASE] Auth state changed:', event, session?.user?.id)
        if (session?.user) {
          await loadUserProfile(session.user)
        } else {
          setUser(null)
        }
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await loadUserProfile(session.user)
      }
    } catch (error) {
      console.error('🔐 [SUPABASE] Error checking auth status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('🔐 [SUPABASE] Loading profile for user:', supabaseUser.id)
      
      // Get user profile from profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single()

      if (error) {
        console.error('🔐 [SUPABASE] Error loading profile:', error)
        // If profile doesn't exist, create a basic one from auth user data
        const newProfile = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          full_name: supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || 'User',
          role: supabaseUser.user_metadata?.role || 'student',
          wallet_address: null,
          wallet_connected: false,
        }
        console.log('🔐 [SUPABASE] Using fallback profile:', newProfile)
        setUser(newProfile)
        return
      }

      console.log('🔐 [SUPABASE] Profile loaded:', profile)
      
      const userData: User = {
        id: profile.id,
        email: profile.email,
        full_name: profile.name || profile.full_name || supabaseUser.user_metadata?.full_name || 'User',
        role: profile.role,
        wallet_address: profile.wallet_address,
        wallet_connected: profile.wallet_connected || false,
      }

      setUser(userData)
    } catch (error) {
      console.error('🔐 [SUPABASE] Error in loadUserProfile:', error)
    }
  }

  const signUp = async (email: string, password: string, userData: { name: string; role: 'student' | 'lecturer' }) => {
    try {
      console.log('🔐 [SUPABASE] Starting signup for:', email)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.name,
            role: userData.role
          }
        }
      })

      console.log('🔐 [SUPABASE] Signup response:', { data: !!data, error: !!error })

      if (error) {
        console.log('🔐 [SUPABASE] Signup failed:', error.message)
        return { error: new Error(error.message) }
      }

      console.log('🔐 [SUPABASE] Signup successful')
      return { error: null }
    } catch (error) {
      console.error('🔐 [SUPABASE] Signup error:', error)
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      console.log('🔐 [SUPABASE] Starting signin for:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      console.log('🔐 [SUPABASE] Signin response:', { data: !!data, error: !!error })

      if (error) {
        console.log('🔐 [SUPABASE] Signin failed:', error.message)
        return { error: new Error(error.message) }
      }

      console.log('🔐 [SUPABASE] Signin successful')
      return { error: null }
    } catch (error) {
      console.error('🔐 [SUPABASE] Signin error:', error)
      return { error }
    }
  }

  const signOut = async () => {
    try {
      console.log('🔐 [SUPABASE] Signing out')
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('🔐 [SUPABASE] Signout error:', error)
      }
      setUser(null)
    } catch (error) {
      console.error('🔐 [SUPABASE] Signout error:', error)
    }
  }

  const signInWithWallet = async (walletAddress: string) => {
    try {
      console.log('🔐 [SUPABASE] Wallet signin for:', walletAddress)
      
      // Check if user exists with this wallet address
      const { data: existingUser, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('🔐 [SUPABASE] Error checking existing user:', fetchError)
        return { error: new Error('Failed to check existing user') }
      }

      if (existingUser) {
        // User exists, sign them in
        console.log('🔐 [SUPABASE] Existing user found, signing in')
        const userData: User = {
          id: existingUser.id,
          email: existingUser.email,
          full_name: existingUser.name,
          role: existingUser.role,
          wallet_address: existingUser.wallet_address,
          wallet_connected: true,
        }
        setUser(userData)
        return { error: null, isNewUser: false }
      } else {
        // User doesn't exist, they need to sign up first
        console.log('🔐 [SUPABASE] No existing user found')
        return { error: new Error('No account found with this wallet. Please sign up first.') }
      }
    } catch (error) {
      console.error('🔐 [SUPABASE] Wallet signin error:', error)
      return { error }
    }
  }

  const signUpWithWallet = async (walletAddress: string, userData: { name: string; role: 'student' | 'lecturer' }) => {
    try {
      console.log('🔐 [SUPABASE] Wallet signup for:', walletAddress)
      
      // Create a unique email for wallet users (since Supabase auth requires email)
      const walletEmail = `${walletAddress.slice(0, 8)}@wallet.local`
      
      // First, create a Supabase auth user with a random password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: walletEmail,
        password: Math.random().toString(36).slice(-12), // Random password
        options: {
          data: {
            full_name: userData.name,
            role: userData.role,
            wallet_address: walletAddress
          }
        }
      })

      if (authError) {
        console.error('🔐 [SUPABASE] Wallet auth signup error:', authError)
        return { error: new Error(authError.message) }
      }

      // The profile will be created automatically by the database trigger
      // Update the profile with wallet-specific information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          wallet_address: walletAddress,
          wallet_connected: true,
          name: userData.name,
          role: userData.role,
        })
        .eq('id', authData.user?.id)

      if (profileError) {
        console.error('🔐 [SUPABASE] Profile update error:', profileError)
        // Don't fail the signup if profile update fails, the user is still created
      }

      console.log('🔐 [SUPABASE] Wallet signup successful')
      return { error: null }
    } catch (error) {
      console.error('🔐 [SUPABASE] Wallet signup error:', error)
      return { error }
    }
  }

  const updateProfile = async (updates: { name?: string; role?: string }) => {
    try {
      if (!user) {
        return { error: new Error('No user logged in') }
      }

      console.log('🔐 [SUPABASE] Updating profile:', updates)
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        console.error('🔐 [SUPABASE] Profile update error:', error)
        return { error: new Error(error.message) }
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, ...updates } : null)
      console.log('🔐 [SUPABASE] Profile updated successfully')
      return { error: null }
    } catch (error) {
      console.error('🔐 [SUPABASE] Profile update error:', error)
      return { error }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signUp,
        signIn,
        signOut,
        signInWithWallet,
        signUpWithWallet,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}