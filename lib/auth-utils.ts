/**
 * Authentication and role-based routing utilities
 */

export type UserRole = 'student' | 'lecturer' | 'admin'

export interface AuthResult {
  success: boolean
  error?: string
  user?: any
}

export interface User {
  id: string
  email: string
  username?: string
  display_name?: string
  role: UserRole
  wallet_address?: string
  wallet_connected_at?: Date
  email_verified?: boolean
  last_login?: Date
  created_at?: Date
  updated_at?: Date
  preferred_language?: string
  accessibility_settings?: any
}

/**
 * Get the appropriate dashboard route based on user role
 */
export function getRoleBasedDashboard(role: UserRole): string {
  switch (role) {
    case 'lecturer':
      return '/dashboard?role=lecturer'
    case 'student':
      return '/dashboard?role=student'
    case 'admin':
      return '/dashboard?role=admin'
    default:
      return '/dashboard'
  }
}

/**
 * Get the default redirect route after login
 */
export function getDefaultRedirect(role?: UserRole): string {
  return role ? getRoleBasedDashboard(role) : '/dashboard'
}

/**
 * Check if user has required role for access
 */
export function hasRole(userRole: string | undefined, requiredRoles: UserRole[]): boolean {
  if (!userRole) return false
  return requiredRoles.includes(userRole as UserRole)
}

/**
 * Get role-specific page title
 */
export function getRoleBasedTitle(role: UserRole): string {
  switch (role) {
    case 'lecturer':
      return 'Lecturer Dashboard'
    case 'student':
      return 'Student Dashboard'
    case 'admin':
      return 'Admin Dashboard'
    default:
      return 'Dashboard'
  }
}

/**
 * Get role-specific welcome message
 */
export function getRoleBasedWelcomeMessage(role: UserRole, userName?: string): string {
  const name = userName?.split(' ')[0] || 'User'
  
  switch (role) {
    case 'lecturer':
      return `Welcome back, ${name}! Manage your sessions and track student engagement.`
    case 'student':
      return `Welcome back, ${name}! Continue learning with AI-powered captions and translations.`
    case 'admin':
      return `Welcome back, ${name}! Monitor system performance and manage users.`
    default:
      return `Welcome back, ${name}!`
  }
}

/**
 * Enhanced role checking with permissions
 */
export function hasPermission(userRole: UserRole | undefined, permission: string): boolean {
  if (!userRole) return false
  
  const rolePermissions: Record<UserRole, string[]> = {
    student: ['session:join', 'session:leave', 'caption:view', 'payment:contribute'],
    lecturer: ['session:create', 'session:edit', 'session:end', 'participant:manage', 'caption:edit', 'session:join', 'session:leave', 'caption:view', 'payment:contribute'],
    admin: ['admin:users', 'admin:sessions', 'admin:analytics', 'admin:settings', 'session:create', 'session:edit', 'session:end', 'participant:manage', 'caption:edit', 'session:join', 'session:leave', 'caption:view', 'payment:contribute']
  }
  
  return rolePermissions[userRole]?.includes(permission) || false
}

/**
 * Get user-friendly error messages
 */
export function getAuthErrorMessage(error: string): string {
  const errorMessages: Record<string, string> = {
    'Invalid email or password': 'Invalid email or password. Please check your credentials and try again.',
    'Email already registered': 'This email is already registered. Please use a different email or try signing in.',
    'Username already taken': 'This username is already taken. Please choose a different username.',
    'Invalid email format': 'Please enter a valid email address.',
    'Password too weak': 'Password must be at least 8 characters long and contain both letters and numbers.',
    'Account locked': 'Your account has been temporarily locked due to too many failed login attempts. Please try again later.',
    'Email not verified': 'Please verify your email address before signing in.',
    'Wallet connection failed': 'Failed to connect wallet. Please try again.',
    'Invalid wallet address': 'Please provide a valid Solana wallet address.',
    'Session expired': 'Your session has expired. Please sign in again.',
    'Rate limit exceeded': 'Too many attempts. Please wait a few minutes before trying again.',
    'Network error': 'Network error occurred. Please check your connection and try again.',
    'Server error': 'An unexpected error occurred. Please try again later.'
  }
  
  return errorMessages[error] || 'An unexpected error occurred. Please try again.'
}

/**
 * Validate session and return user info
 */
export function validateSession(session: any): { valid: boolean; user?: User; error?: string } {
  if (!session) {
    return { valid: false, error: 'No session found' }
  }
  
  if (!session.user) {
    return { valid: false, error: 'Invalid session' }
  }
  
  const user: User = {
    id: session.user.id,
    email: session.user.email,
    username: session.user.user_metadata?.username,
    display_name: session.user.user_metadata?.display_name || session.user.user_metadata?.full_name,
    role: session.user.user_metadata?.role || 'student',
    wallet_address: session.user.user_metadata?.wallet_address,
    wallet_connected_at: session.user.user_metadata?.wallet_connected_at,
    email_verified: session.user.email_confirmed_at ? true : false,
    last_login: session.user.last_sign_in_at,
    created_at: session.user.created_at,
    updated_at: session.user.updated_at,
    preferred_language: session.user.user_metadata?.preferred_language || 'en',
    accessibility_settings: session.user.user_metadata?.accessibility_settings
  }
  
  return { valid: true, user }
}
