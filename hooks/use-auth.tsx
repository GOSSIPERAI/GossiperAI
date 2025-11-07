'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { AuthValidator } from '@/lib/auth-validation'
import { RateLimiter } from '@/lib/auth-security'
import { handleAuthError, handleSupabaseError } from '@/lib/auth-error-handler'
import type { AuthResult } from '@/lib/auth-utils'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { USER_FIELDS, USER_METADATA_FIELDS, USER_ROLES } from '@/lib/constants'

interface AuthUser {
  id: string
  email?: string
  full_name: string
  role: string
  wallet_address?: string | null
  wallet_connected: boolean
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  signUp: (email: string, password: string, userData: { name: string; role: 'student' | 'lecturer' }) => Promise<AuthResult>
  signIn: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
  signInWithWallet: (walletAddress: string) => Promise<AuthResult & { isNewUser?: boolean }>
  signUpWithWallet: (walletAddress: string, userData: { name: string; role: 'student' | 'lecturer' }) => Promise<AuthResult>
  updateProfile: (updates: { name?: string; role?: string }) => Promise<AuthResult>
  refreshUser: () => Promise<void>
  connectWallet: (walletAddress: string) => Promise<AuthResult>
  disconnectWallet: () => Promise<AuthResult>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signUp: async () => ({ success: false, error: 'Not implemented' }),
  signIn: async () => ({ success: false, error: 'Not implemented' }),
  signOut: async () => {},
  signInWithWallet: async () => ({ success: false, error: 'Not implemented' }),
  signUpWithWallet: async () => ({ success: false, error: 'Not implemented' }),
  updateProfile: async () => ({ success: false, error: 'Not implemented' }),
  refreshUser: async () => {},
  connectWallet: async () => ({ success: false, error: 'Not implemented' }),
  disconnectWallet: async () => ({ success: false, error: 'Not implemented' }),
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
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
          full_name: supabaseUser.user_metadata?.[USER_METADATA_FIELDS.FULL_NAME] || USER_FIELDS.DEFAULT_NAME,
          role: supabaseUser.user_metadata?.[USER_METADATA_FIELDS.ROLE] || USER_FIELDS.DEFAULT_ROLE,
          wallet_address: null,
          wallet_connected: false,
        }
        console.log('🔐 [SUPABASE] Using fallback profile:', newProfile)
        setUser(newProfile)
        return
      }

      console.log('🔐 [SUPABASE] Profile loaded:', profile)
      
      const userData: AuthUser = {
        id: profile.id,
        email: profile.email,
        full_name: profile[USER_FIELDS.DISPLAY_NAME] || profile[USER_FIELDS.FULL_NAME] || supabaseUser.user_metadata?.[USER_METADATA_FIELDS.FULL_NAME] || USER_FIELDS.DEFAULT_NAME,
        role: profile[USER_FIELDS.ROLE],
        wallet_address: profile[USER_FIELDS.WALLET_ADDRESS],
        wallet_connected: profile[USER_FIELDS.WALLET_CONNECTED] || false,
      }

      setUser(userData)
    } catch (error) {
      console.error('🔐 [SUPABASE] Error in loadUserProfile:', error)
    }
  }

  const signUp = async (email: string, password: string, userData: { name: string; role: 'student' | 'lecturer' }): Promise<AuthResult> => {
    try {
      // Client-side validation
      const validation = AuthValidator.validateSignupForm({
        email,
        username: userData.name,
        password,
        displayName: userData.name,
        role: userData.role
      })

      if (!validation.valid) {
        const firstError = Object.values(validation.errors)[0]
        return { success: false, error: firstError }
      }

      // Rate limiting check
      const clientId = email // Use email as identifier for rate limiting
      if (!RateLimiter.checkRateLimit(clientId)) {
        return { success: false, error: 'Rate limit exceeded' }
      }

      console.log('🔐 [SUPABASE] Starting signup for:', email)
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            full_name: userData.name.trim(),
            role: userData.role,
            username: userData.name.toLowerCase().trim().replace(/[^a-zA-Z0-9_-]/g, '')
          }
        }
      })

      console.log('🔐 [SUPABASE] Signup response:', { data: !!data, error: !!error })

      if (error) {
        console.log('🔐 [SUPABASE] Signup failed:', error.message)
        const errorMessage = handleSupabaseError(error)
        return { success: false, error: errorMessage }
      }

      console.log('🔐 [SUPABASE] Signup successful')
      return { success: true, user: data.user }
    } catch (error) {
      console.error('🔐 [SUPABASE] Signup error:', error)
      const errorMessage = handleAuthError(error)
      return { success: false, error: errorMessage }
    }
  }

  const signIn = async (email: string, password: string): Promise<AuthResult> => {
    try {
      // Client-side validation
      const validation = AuthValidator.validateSigninForm({ email, password })
      if (!validation.valid) {
        const firstError = Object.values(validation.errors)[0]
        return { success: false, error: firstError }
      }

      // Rate limiting check
      const clientId = email
      if (!RateLimiter.checkRateLimit(clientId)) {
        return { success: false, error: 'Rate limit exceeded' }
      }

      console.log('🔐 [SUPABASE] Starting signin for:', email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      })

      console.log('🔐 [SUPABASE] Signin response:', { data: !!data, error: !!error })

      if (error) {
        console.log('🔐 [SUPABASE] Signin failed:', error.message)
        const errorMessage = handleSupabaseError(error)
        return { success: false, error: errorMessage }
      }

      console.log('🔐 [SUPABASE] Signin successful')
      // Immediately load profile and set user to avoid race with onAuthStateChange
      if (data.user) {
        await loadUserProfile(data.user)
      }
      return { success: true, user: data.user }
    } catch (error) {
      console.error('🔐 [SUPABASE] Signin error:', error)
      const errorMessage = handleAuthError(error)
      return { success: false, error: errorMessage }
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

  const signInWithWallet = async (walletAddress: string): Promise<AuthResult & { isNewUser?: boolean }> => {
    try {
      // Validate wallet address
      const validation = AuthValidator.validateWalletAddress(walletAddress)
      if (!validation.valid) {
        return { success: false, error: validation.error || 'Invalid wallet address' }
      }

      console.log('🔐 [SUPABASE] Wallet signin for:', walletAddress)
      
      // Check if user exists with this wallet address
      const { data: existingUser, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', walletAddress)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('🔐 [SUPABASE] Error checking existing user:', fetchError)
        return { success: false, error: 'Failed to check existing user' }
      }

      if (existingUser) {
        // User exists, sign them in
        console.log('🔐 [SUPABASE] Existing user found, signing in')
        const userData: AuthUser = {
          id: existingUser.id,
          email: existingUser.email,
          full_name: existingUser[USER_FIELDS.DISPLAY_NAME] || existingUser[USER_FIELDS.FULL_NAME] || USER_FIELDS.DEFAULT_NAME,
          role: existingUser[USER_FIELDS.ROLE],
          wallet_address: existingUser[USER_FIELDS.WALLET_ADDRESS],
          wallet_connected: true,
        }
        setUser(userData)
        return { success: true, user: userData, isNewUser: false }
      } else {
        // User doesn't exist, they need to sign up first
        console.log('🔐 [SUPABASE] No existing user found')
        return { success: false, error: 'No account found with this wallet. Please sign up first.' }
      }
    } catch (error) {
      console.error('🔐 [SUPABASE] Wallet signin error:', error)
      const errorMessage = handleAuthError(error)
      return { success: false, error: errorMessage }
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
        const errorMessage = handleSupabaseError(authError)
        return { success: false, error: errorMessage }
      }

      // The profile will be created automatically by the database trigger
      // Update the profile with wallet-specific information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          wallet_address: walletAddress,
          wallet_connected: true,
          [USER_FIELDS.FULL_NAME]: userData.name,
          [USER_FIELDS.ROLE]: userData.role,
        })
        .eq('id', authData.user?.id)

      if (profileError) {
        console.error('🔐 [SUPABASE] Profile update error:', profileError)
        // Don't fail the signup if profile update fails, the user is still created
      }

      console.log('🔐 [SUPABASE] Wallet signup successful')
      return { success: true, user: authData.user }
    } catch (error) {
      console.error('🔐 [SUPABASE] Wallet signup error:', error)
      const errorMessage = handleAuthError(error)
      return { success: false, error: errorMessage }
    }
  }

  const updateProfile = async (updates: { name?: string; role?: string }): Promise<AuthResult> => {
    try {
      if (!user) {
        return { success: false, error: 'No user logged in' }
      }

      console.log('🔐 [SUPABASE] Updating profile:', updates)
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)

      if (error) {
        console.error('🔐 [SUPABASE] Profile update error:', error)
        const errorMessage = handleSupabaseError(error)
        return { success: false, error: errorMessage }
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, ...updates } : null)
      console.log('🔐 [SUPABASE] Profile updated successfully')
      return { success: true, user: user }
    } catch (error) {
      console.error('🔐 [SUPABASE] Profile update error:', error)
      const errorMessage = handleAuthError(error)
      return { success: false, error: errorMessage }
    }
  }

  const refreshUser = async (): Promise<void> => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await loadUserProfile(session.user)
      }
    } catch (error) {
      console.error('🔐 [SUPABASE] Error refreshing user:', error)
    }
  }

  const connectWallet = async (walletAddress: string): Promise<AuthResult> => {
    try {
      if (!user) {
        return { success: false, error: 'No user logged in' }
      }

      // Validate wallet address
      const validation = AuthValidator.validateWalletAddress(walletAddress)
      if (!validation.valid) {
        return { success: false, error: validation.error || 'Invalid wallet address' }
      }

      // Check if wallet is already connected to another user
      const { data: existingWallet, error: fetchError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('wallet_address', walletAddress)
        .neq('id', user.id)
        .single()

      if (existingWallet) {
        return { success: false, error: 'Wallet address already connected to another account' }
      }

      // Update user's wallet address
      const { error } = await supabase
        .from('profiles')
        .update({
          wallet_address: walletAddress,
          wallet_connected: true,
          wallet_connected_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        console.error('🔐 [SUPABASE] Wallet connection error:', error)
        const errorMessage = handleSupabaseError(error)
        return { success: false, error: errorMessage }
      }

      // Update local user state
      setUser(prev => prev ? { 
        ...prev, 
        wallet_address: walletAddress, 
        wallet_connected: true 
      } : null)

      return { success: true, user: user }
    } catch (error) {
      console.error('🔐 [SUPABASE] Wallet connection error:', error)
      const errorMessage = handleAuthError(error)
      return { success: false, error: errorMessage }
    }
  }

  const disconnectWallet = async (): Promise<AuthResult> => {
    try {
      if (!user) {
        return { success: false, error: 'No user logged in' }
      }

      // Update user's wallet address
      const { error } = await supabase
        .from('profiles')
        .update({
          wallet_address: null,
          wallet_connected: false,
          wallet_connected_at: null
        })
        .eq('id', user.id)

      if (error) {
        console.error('🔐 [SUPABASE] Wallet disconnection error:', error)
        const errorMessage = handleSupabaseError(error)
        return { success: false, error: errorMessage }
      }

      // Update local user state
      setUser(prev => prev ? { 
        ...prev, 
        wallet_address: null, 
        wallet_connected: false 
      } : null)

      return { success: true, user: user }
    } catch (error) {
      console.error('🔐 [SUPABASE] Wallet disconnection error:', error)
      const errorMessage = handleAuthError(error)
      return { success: false, error: errorMessage }
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
        refreshUser,
        connectWallet,
        disconnectWallet,
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
