/**
 * Session Management Types
 * Enhanced type definitions for session management with improved validation and analytics
 */

// Core session status types
export type SessionStatus = "draft" | "scheduled" | "active" | "paused" | "cancelled" | "ended"

export type SessionMode = "classroom" | "conference" | "podcast" | "livestream"

export type UserRole = "student" | "lecturer"

// Accessibility settings
export interface AccessibilitySettings {
  highContrast?: boolean
  fontSize?: "small" | "medium" | "large"
  screenReaderOptimized?: boolean
  captionSpeed?: "slow" | "normal" | "fast"
  autoScroll?: boolean
}

// Recording settings
export interface RecordingSettings {
  enabled?: boolean
  autoRecord?: boolean
  includeVideo?: boolean
  quality?: "low" | "medium" | "high"
}

// Notification settings
export interface NotificationSettings {
  emailNotifications?: boolean
  pushNotifications?: boolean
  sessionStart?: boolean
  sessionEnd?: boolean
  newParticipant?: boolean
}

// Enhanced session interface
export interface Session {
  id: string
  title: string
  description?: string
  code: string
  created_by: string
  start_time?: string
  end_time?: string
  status: SessionStatus
  original_language: string
  available_languages: string[]
  mode: SessionMode
  payment_goal?: number
  max_participants?: number
  accessibility_settings?: AccessibilitySettings
  recording_settings?: RecordingSettings
  notification_settings?: NotificationSettings
  created_at: string
  updated_at: string
}

// Session participant interface
export interface SessionParticipant {
  id: string
  session_id: string
  user_id: string
  joined_at: string
  left_at?: string
  selected_language: string
  is_active: boolean
  user?: {
    id: string
    full_name: string
    email: string
    role: UserRole
  }
}

// Session creation data
export interface CreateSessionData {
  title: string
  description?: string
  startTime?: string
  originalLanguage: string
  availableLanguages: string[]
  mode: SessionMode
  paymentGoal?: number
  maxParticipants?: number
  accessibilitySettings?: AccessibilitySettings
  recordingSettings?: RecordingSettings
  notificationSettings?: NotificationSettings
}

// Session update data
export interface UpdateSessionData {
  title?: string
  description?: string
  start_time?: string
  end_time?: string
  status?: SessionStatus
  max_participants?: number
  accessibility_settings?: AccessibilitySettings
  recording_settings?: RecordingSettings
  notification_settings?: NotificationSettings
}

// Session analytics types
export interface SessionAnalytics {
  sessionId: string
  totalParticipants: number
  activeParticipants: number
  averageSessionDuration: number
  totalTranscriptions: number
  languageDistribution: Record<string, number>
  participantEngagement: {
    userId: string
    joinTime: string
    leaveTime?: string
    duration: number
    selectedLanguage: string
  }[]
  technicalMetrics: {
    averageLatency: number
    transcriptionAccuracy: number
    errorCount: number
  }
}

// Session validation result
export interface SessionValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

// Session filter options
export interface SessionFilterOptions {
  status?: SessionStatus[]
  mode?: SessionMode[]
  createdBy?: string
  startDateFrom?: string
  startDateTo?: string
  hasParticipants?: boolean
}

// Session summary for dashboard
export interface SessionSummary {
  id: string
  title: string
  code: string
  status: SessionStatus
  mode: SessionMode
  participantCount: number
  startTime?: string
  createdAt: string
}
