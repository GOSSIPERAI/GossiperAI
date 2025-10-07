// Enhanced global auth error handler
import { getAuthErrorMessage } from './auth-utils'

export function handleAuthError(error: any): string {
  console.error('Auth error:', error)
  
  // Supabase auth errors
  if (error.message?.includes('Invalid login credentials')) {
    return 'Invalid email or password'
  }
  
  if (error.message?.includes('User already registered')) {
    return 'Email already registered'
  }
  
  if (error.message?.includes('Password should be at least')) {
    return 'Password too weak'
  }
  
  if (error.message?.includes('Invalid email')) {
    return 'Invalid email format'
  }
  
  if (error.message?.includes('Email not confirmed')) {
    return 'Email not verified'
  }
  
  if (error.message?.includes('Too many requests')) {
    return 'Rate limit exceeded'
  }
  
  if (error.message?.includes('User not found')) {
    return 'Invalid email or password'
  }
  
  if (error.message?.includes('Invalid token')) {
    return 'Session expired'
  }
  
  if (error.message?.includes('Token expired')) {
    return 'Session expired'
  }
  
  if (error.message?.includes('Network error')) {
    return 'Network error'
  }
  
  // Wallet-related errors
  if (error.message?.includes('Wallet connection failed')) {
    return 'Wallet connection failed'
  }
  
  if (error.message?.includes('Invalid wallet address')) {
    return 'Invalid wallet address'
  }
  
  // Validation errors
  if (error.message?.includes('Username already taken')) {
    return 'Username already taken'
  }
  
  if (error.message?.includes('Invalid username')) {
    return 'Invalid username format'
  }
  
  // Server errors
  if (error.status >= 500) {
    return 'Server error'
  }
  
  if (error.status === 429) {
    return 'Rate limit exceeded'
  }
  
  if (error.status === 423) {
    return 'Account locked'
  }
  
  // Default error message with user-friendly formatting
  const errorMessage = error.message || 'An authentication error occurred'
  return getAuthErrorMessage(errorMessage)
}

export function handleSupabaseError(error: any): string {
  console.error('Supabase error:', error)
  
  // Supabase specific error codes
  if (error.code === '23505') { // Unique violation
    if (error.constraint?.includes('email')) {
      return 'Email already registered'
    }
    if (error.constraint?.includes('username')) {
      return 'Username already taken'
    }
    if (error.constraint?.includes('wallet_address')) {
      return 'Wallet address already connected to another account'
    }
  }
  
  if (error.code === '23503') { // Foreign key violation
    return 'Invalid reference data'
  }
  
  if (error.code === '23502') { // Not null violation
    return 'Required field is missing'
  }
  
  if (error.code === '23514') { // Check violation
    return 'Invalid data format'
  }
  
  // Fallback to general error handler
  return handleAuthError(error)
}

export function createErrorResponse(message: string, status: number = 400) {
  return {
    success: false,
    error: message,
    status
  }
}

export function createSuccessResponse(data: any, message?: string) {
  return {
    success: true,
    data,
    message
  }
}
