// Core types for Gossiper application based on SRS requirements

export interface User {
  id: string
  email: string
  name: string
  role: "student" | "lecturer" | "admin"
  walletAddress?: string
  walletConnected?: boolean
  loginTimestamp?: string
  preferredLanguage: string
  accessibilitySettings?: AccessibilitySettings
  createdAt?: Date
  updatedAt?: Date
}

export interface AccessibilitySettings {
  highContrast: boolean
  fontSize: "small" | "medium" | "large"
  screenReaderOptimized: boolean
  keyboardNavigation: boolean
}

export interface Session {
  id: string
  title: string
  description: string
  lecturerId: string
  lecturer: User
  startTime: Date
  endTime?: Date
  status: "scheduled" | "active" | "ended"
  joinCode: string
  originalLanguage: string
  availableLanguages: string[]
  participants: SessionParticipant[]
  paymentPool: PaymentPool
  captions: Caption[]
  mode: "classroom" | "conference" | "podcast" | "livestream"
  createdAt: Date
  updatedAt: Date
}

export interface SessionParticipant {
  id: string
  userId: string
  user: User
  sessionId: string
  selectedLanguage: string
  joinedAt: Date
  leftAt?: Date
  hasContributed: boolean
}

export interface Caption {
  id: string
  sessionId: string
  originalText: string
  translations: Record<string, string> // language code -> translated text
  timestamp: Date
  speakerId?: string
  confidence: number
}

export interface PaymentPool {
  id: string
  sessionId: string
  goalAmount: number // in USDC cents
  currentAmount: number // in USDC cents
  currency: "USDC" | "SOL"
  contributions: Contribution[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Contribution {
  id: string
  userId: string
  user: User
  poolId: string
  amount: number // in USDC cents
  transactionHash: string
  status: "pending" | "confirmed" | "failed"
  createdAt: Date
  confirmedAt?: Date
}

export interface PaymentTransaction {
  id: string
  userId: string
  sessionId?: string
  type: "tip" | "pool_contribution" | "subscription"
  amount: number // in USDC cents
  currency: "USDC" | "SOL"
  transactionHash: string
  status: "pending" | "confirmed" | "failed"
  metadata?: Record<string, any>
  createdAt: Date
  confirmedAt?: Date
}

export interface Language {
  code: string
  name: string
  nativeName: string
  isSupported: boolean
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// WebSocket message types for real-time captions
export interface CaptionMessage {
  type: "caption" | "translation" | "session_update" | "participant_update"
  sessionId: string
  data: any
  timestamp: Date
}

// Form types
export interface CreateSessionForm {
  title: string
  description: string
  startTime: Date
  originalLanguage: string
  availableLanguages: string[]
  mode: Session["mode"]
  paymentGoal?: number
}

export interface JoinSessionForm {
  joinCode: string
  preferredLanguage: string
}

export interface AuthForm {
  email: string
  password: string
  name?: string
  role?: User["role"]
}

export interface PaymentForm {
  amount: number
  type: "tip" | "pool_contribution"
  sessionId?: string
}
