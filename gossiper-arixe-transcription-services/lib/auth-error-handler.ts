// Global auth error handler
export function handleAuthError(error: any) {
  console.error('Auth error:', error)
  
  // Common Supabase auth errors
  if (error.message?.includes('Invalid login credentials')) {
    return 'Invalid email or password'
  }
  
  if (error.message?.includes('User already registered')) {
    return 'An account with this email already exists'
  }
  
  if (error.message?.includes('Password should be at least')) {
    return 'Password must be at least 6 characters long'
  }
  
  if (error.message?.includes('Invalid email')) {
    return 'Please enter a valid email address'
  }
  
  // Default error message
  return error.message || 'An authentication error occurred'
}
