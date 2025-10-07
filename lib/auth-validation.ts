// Enhanced authentication validation system
export interface ValidationResult {
  valid: boolean
  error?: string
}

export class AuthValidator {
  static validateEmail(email: string): ValidationResult {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
    return {
      valid: emailRegex.test(email),
      error: emailRegex.test(email) ? undefined : 'Invalid email format'
    }
  }

  static validateUsername(username: string): ValidationResult {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/
    return {
      valid: usernameRegex.test(username),
      error: usernameRegex.test(username) ? undefined : 'Username must be 3-50 characters and contain only letters, numbers, hyphens, and underscores'
    }
  }

  static validatePassword(password: string): ValidationResult {
    if (password.length < 8) {
      return { valid: false, error: 'Password must be at least 8 characters long' }
    }
    if (password.length > 128) {
      return { valid: false, error: 'Password must be less than 128 characters' }
    }
    if (!/[a-zA-Z]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one letter' }
    }
    if (!/[0-9]/.test(password)) {
      return { valid: false, error: 'Password must contain at least one number' }
    }
    return { valid: true }
  }

  static validateWalletAddress(address: string): ValidationResult {
    // Solana address validation
    const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/
    return {
      valid: solanaRegex.test(address),
      error: solanaRegex.test(address) ? undefined : 'Invalid Solana wallet address'
    }
  }

  static validateDisplayName(displayName: string): ValidationResult {
    if (!displayName || displayName.trim().length === 0) {
      return { valid: false, error: 'Display name is required' }
    }
    if (displayName.length < 2) {
      return { valid: false, error: 'Display name must be at least 2 characters long' }
    }
    if (displayName.length > 100) {
      return { valid: false, error: 'Display name must be less than 100 characters' }
    }
    return { valid: true }
  }

  static validateRole(role: string): ValidationResult {
    const validRoles = ['student', 'lecturer', 'admin']
    return {
      valid: validRoles.includes(role),
      error: validRoles.includes(role) ? undefined : 'Invalid role. Must be student, lecturer, or admin'
    }
  }

  // Comprehensive form validation
  static validateSignupForm(data: {
    email: string
    username: string
    password: string
    displayName?: string
    role?: string
  }): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {}

    const emailValidation = this.validateEmail(data.email)
    if (!emailValidation.valid) {
      errors.email = emailValidation.error || 'Invalid email'
    }

    const usernameValidation = this.validateUsername(data.username)
    if (!usernameValidation.valid) {
      errors.username = usernameValidation.error || 'Invalid username'
    }

    const passwordValidation = this.validatePassword(data.password)
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.error || 'Invalid password'
    }

    if (data.displayName) {
      const displayNameValidation = this.validateDisplayName(data.displayName)
      if (!displayNameValidation.valid) {
        errors.displayName = displayNameValidation.error || 'Invalid display name'
      }
    }

    if (data.role) {
      const roleValidation = this.validateRole(data.role)
      if (!roleValidation.valid) {
        errors.role = roleValidation.error || 'Invalid role'
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    }
  }

  static validateSigninForm(data: {
    email: string
    password: string
  }): { valid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {}

    const emailValidation = this.validateEmail(data.email)
    if (!emailValidation.valid) {
      errors.email = emailValidation.error || 'Invalid email'
    }

    if (!data.password || data.password.trim().length === 0) {
      errors.password = 'Password is required'
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    }
  }
}
