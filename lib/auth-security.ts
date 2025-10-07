// Enhanced authentication security utilities (Supabase-compatible)
import crypto from 'crypto'

export class AuthSecurity {
  static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  static generateEmailVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  static generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  static generateSessionToken(): string {
    return crypto.randomBytes(64).toString('hex')
  }

  // Generate secure random string for various purposes
  static generateRandomString(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  // Hash sensitive data for storage
  static hashSensitiveData(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex')
  }

  // Verify sensitive data hash
  static verifySensitiveData(data: string, hash: string): boolean {
    const dataHash = this.hashSensitiveData(data)
    return crypto.timingSafeEqual(Buffer.from(dataHash), Buffer.from(hash))
  }
}

// Rate limiting utility
export class RateLimiter {
  private static attempts = new Map<string, { count: number; resetTime: number }>()
  private static readonly MAX_ATTEMPTS = 5
  private static readonly WINDOW_MS = 15 * 60 * 1000 // 15 minutes

  static checkRateLimit(identifier: string): boolean {
    const now = Date.now()
    const userAttempts = this.attempts.get(identifier)

    if (!userAttempts || now > userAttempts.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + this.WINDOW_MS })
      return true
    }

    if (userAttempts.count >= this.MAX_ATTEMPTS) {
      return false
    }

    userAttempts.count++
    return true
  }

  static resetAttempts(identifier: string): void {
    this.attempts.delete(identifier)
  }

  static getRemainingAttempts(identifier: string): number {
    const userAttempts = this.attempts.get(identifier)
    if (!userAttempts) return this.MAX_ATTEMPTS
    return Math.max(0, this.MAX_ATTEMPTS - userAttempts.count)
  }

  static getResetTime(identifier: string): number | null {
    const userAttempts = this.attempts.get(identifier)
    return userAttempts ? userAttempts.resetTime : null
  }
}

// Security headers utility
export class SecurityHeaders {
  static getSecurityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    }
  }

  static getCORSHeaders(): Record<string, string> {
    return {
      'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
        ? 'https://gossiper-ai.vercel.app' 
        : 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    }
  }
}

// Input sanitization utility
export class InputSanitizer {
  static sanitizeString(input: string): string {
    return input.trim().replace(/[<>]/g, '')
  }

  static sanitizeEmail(email: string): string {
    return email.toLowerCase().trim()
  }

  static sanitizeUsername(username: string): string {
    return username.toLowerCase().trim().replace(/[^a-zA-Z0-9_-]/g, '')
  }

  static sanitizeDisplayName(displayName: string): string {
    return displayName.trim().replace(/[<>]/g, '')
  }

  static sanitizeWalletAddress(address: string): string {
    return address.trim()
  }
}
