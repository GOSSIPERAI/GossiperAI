/**
 * Session Validation Utilities
 * Provides validation logic for session creation, updates, and state transitions
 */

import type {
  Session,
  CreateSessionData,
  UpdateSessionData,
  SessionStatus,
  SessionValidationResult,
} from "../types/session"

/**
 * Validates session creation data
 */
export function validateCreateSessionData(data: CreateSessionData): SessionValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Required fields
  if (!data.title || data.title.trim().length === 0) {
    errors.push("Session title is required")
  } else if (data.title.length > 200) {
    errors.push("Session title must be less than 200 characters")
  }

  if (!data.originalLanguage) {
    errors.push("Original language is required")
  }

  if (!data.availableLanguages || data.availableLanguages.length === 0) {
    errors.push("At least one available language is required")
  } else if (!data.availableLanguages.includes(data.originalLanguage)) {
    errors.push("Original language must be included in available languages")
  }

  if (!data.mode) {
    errors.push("Session mode is required")
  }

  // Optional field validation
  if (data.description && data.description.length > 1000) {
    warnings.push("Session description is very long (over 1000 characters)")
  }

  if (data.maxParticipants !== undefined) {
    if (data.maxParticipants < 1) {
      errors.push("Maximum participants must be at least 1")
    } else if (data.maxParticipants > 1000) {
      warnings.push("Maximum participants is very high (over 1000)")
    }
  }

  if (data.paymentGoal !== undefined && data.paymentGoal < 0) {
    errors.push("Payment goal cannot be negative")
  }

  // Start time validation
  if (data.startTime) {
    const startDate = new Date(data.startTime)
    if (isNaN(startDate.getTime())) {
      errors.push("Invalid start time format")
    } else if (startDate < new Date()) {
      warnings.push("Start time is in the past")
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validates session update data
 */
export function validateUpdateSessionData(
  currentSession: Session,
  updateData: UpdateSessionData,
): SessionValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Title validation
  if (updateData.title !== undefined) {
    if (updateData.title.trim().length === 0) {
      errors.push("Session title cannot be empty")
    } else if (updateData.title.length > 200) {
      errors.push("Session title must be less than 200 characters")
    }
  }

  // Description validation
  if (updateData.description !== undefined && updateData.description.length > 1000) {
    warnings.push("Session description is very long (over 1000 characters)")
  }

  // Max participants validation
  if (updateData.max_participants !== undefined) {
    if (updateData.max_participants < 1) {
      errors.push("Maximum participants must be at least 1")
    }
  }

  // Time validation
  if (updateData.start_time) {
    const startDate = new Date(updateData.start_time)
    if (isNaN(startDate.getTime())) {
      errors.push("Invalid start time format")
    }
  }

  if (updateData.end_time) {
    const endDate = new Date(updateData.end_time)
    if (isNaN(endDate.getTime())) {
      errors.push("Invalid end time format")
    }

    if (updateData.start_time || currentSession.start_time) {
      const startDate = new Date(updateData.start_time || currentSession.start_time!)
      if (endDate <= startDate) {
        errors.push("End time must be after start time")
      }
    }
  }

  // Status transition validation
  if (updateData.status) {
    const transitionResult = validateStatusTransition(currentSession.status, updateData.status)
    if (!transitionResult.isValid) {
      errors.push(...transitionResult.errors)
    }
    warnings.push(...transitionResult.warnings)
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validates session status transitions
 */
export function validateStatusTransition(
  currentStatus: SessionStatus,
  newStatus: SessionStatus,
): SessionValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Define valid transitions
  const validTransitions: Record<SessionStatus, SessionStatus[]> = {
    draft: ["scheduled", "cancelled"],
    scheduled: ["active", "cancelled"],
    active: ["paused", "ended", "cancelled"],
    paused: ["active", "ended", "cancelled"],
    cancelled: [], // Cannot transition from cancelled
    ended: [], // Cannot transition from ended
  }

  const allowedTransitions = validTransitions[currentStatus]

  if (!allowedTransitions.includes(newStatus)) {
    errors.push(`Cannot transition from ${currentStatus} to ${newStatus}`)
  }

  // Add warnings for specific transitions
  if (currentStatus === "active" && newStatus === "cancelled") {
    warnings.push("Cancelling an active session will disconnect all participants")
  }

  if (currentStatus === "paused" && newStatus === "ended") {
    warnings.push("Ending a paused session without resuming")
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validates if a user can join a session
 */
export function validateSessionJoin(session: Session, currentParticipantCount: number): SessionValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Check session status
  if (session.status === "ended") {
    errors.push("Cannot join an ended session")
  } else if (session.status === "cancelled") {
    errors.push("Cannot join a cancelled session")
  } else if (session.status === "draft") {
    errors.push("Cannot join a draft session")
  } else if (session.status === "paused") {
    warnings.push("Session is currently paused")
  }

  // Check max participants
  if (session.max_participants && currentParticipantCount >= session.max_participants) {
    errors.push("Session has reached maximum participant capacity")
  }

  // Check if session has started (if scheduled)
  if (session.status === "scheduled" && session.start_time) {
    const startTime = new Date(session.start_time)
    const now = new Date()
    if (now < startTime) {
      warnings.push("Session has not started yet")
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validates session code format
 */
export function validateSessionCode(code: string): boolean {
  // Session codes should be 6 characters, alphanumeric, uppercase
  const codeRegex = /^[A-Z0-9]{6}$/
  return codeRegex.test(code)
}

/**
 * Validates language code format
 */
export function validateLanguageCode(code: string): boolean {
  // ISO 639-1 language codes (2 letters)
  const langRegex = /^[a-z]{2}$/
  return langRegex.test(code)
}
