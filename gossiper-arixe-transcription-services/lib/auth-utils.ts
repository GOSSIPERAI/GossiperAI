/**
 * Authentication and role-based routing utilities
 */

export type UserRole = 'student' | 'lecturer'

/**
 * Get the appropriate dashboard route based on user role
 */
export function getRoleBasedDashboard(role: UserRole): string {
  switch (role) {
    case 'lecturer':
      return '/dashboard?role=lecturer'
    case 'student':
      return '/dashboard?role=student'
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
    default:
      return `Welcome back, ${name}!`
  }
}
