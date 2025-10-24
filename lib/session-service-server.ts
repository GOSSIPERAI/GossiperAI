import { createServerSupabaseClient } from "./supabase-server"
import type { CreateSessionData, Session, SessionParticipant, UpdateSessionData } from "./types/session"
import {
  validateCreateSessionData,
  validateSessionJoin,
  validateUpdateSessionData,
} from "./validation/session-validation"

// Types for session management
// export interface CreateSessionData {
//   title: string
//   description?: string
//   startTime?: string
//   originalLanguage: string
//   availableLanguages: string[]
//   mode: 'classroom' | 'conference' | 'podcast' | 'livestream'
//   paymentGoal?: number
// }

// export interface Session {
//   id: string
//   title: string
//   description?: string
//   code: string
//   created_by: string
//   start_time?: string
//   end_time?: string
//   status: 'scheduled' | 'active' | 'ended'
//   original_language: string
//   available_languages: string[]
//   mode: 'classroom' | 'conference' | 'podcast' | 'livestream'
//   payment_goal?: number
//   created_at: string
//   updated_at: string
//   // Additional properties for UI compatibility
//   lecturer?: string
//   startTime?: string
//   participants?: any[]
//   paymentPool?: {
//     goalAmount: number
//     currentAmount: number
//     contributions: number
//   }
// }

// export interface SessionParticipant {
//   id: string
//   session_id: string
//   user_id: string
//   joined_at: string
//   selected_language: string
//   is_active: boolean
//   user?: {
//     id: string
//     full_name: string
//     email: string
//     role: string
//   }
// }

// Generate unique session code
function generateSessionCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Server-side session functions
export async function createSessionServer(data: CreateSessionData, userId: string): Promise<Session> {
  const supabase = createServerSupabaseClient()

  const validation = validateCreateSessionData(data)
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(", ")}`)
  }

  // Log warnings if any
  if (validation.warnings.length > 0) {
    console.warn("[Session Creation] Warnings:", validation.warnings)
  }

  // Check if user is lecturer
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single()

  if (profileError || !profile) {
    throw new Error("User profile not found")
  }

  if (profile.role !== "lecturer") {
    throw new Error("Only lecturers can create sessions")
  }

  // Generate unique code
  let code = generateSessionCode()
  let isUnique = false
  let attempts = 0

  while (!isUnique && attempts < 10) {
    const { data: existing } = await supabase.from("sessions").select("id").eq("code", code).single()

    if (!existing) {
      isUnique = true
    } else {
      code = generateSessionCode()
      attempts++
    }
  }

  if (!isUnique) {
    throw new Error("Unable to generate unique session code")
  }

  const { data: session, error } = await supabase
    .from("sessions")
    .insert({
      title: data.title,
      description: data.description,
      code,
      created_by: userId,
      start_time: data.startTime,
      original_language: data.originalLanguage,
      available_languages: data.availableLanguages,
      mode: data.mode,
      payment_goal: data.paymentGoal || 0,
      max_participants: data.maxParticipants,
      accessibility_settings: data.accessibilitySettings || {},
      recording_settings: data.recordingSettings || {},
      notification_settings: data.notificationSettings || {},
      status: "scheduled", // Default status for new sessions
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating session:", error)
    throw new Error("Failed to create session")
  }

  return session
}

export async function joinSessionServer(code: string, userId: string, selectedLanguage = "en"): Promise<Session> {
  const supabase = createServerSupabaseClient()

  // Check if user is authenticated and has valid role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single()

  if (profileError || !profile) {
    throw new Error("User profile not found")
  }

  if (!profile.role || (profile.role !== "student" && profile.role !== "lecturer")) {
    throw new Error("Invalid user role")
  }

  // Find session by code
  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("code", code.toUpperCase())
    .single()

  if (sessionError || !session) {
    throw new Error("Session not found")
  }

  // Check if session is still active
  if (session.status === "ended") {
    throw new Error("Session has ended")
  }

  const { data: participantCount } = await supabase
    .from("session_participants")
    .select("id", { count: "exact", head: true })
    .eq("session_id", session.id)
    .eq("is_active", true)

  const currentCount = participantCount || 0
  const joinValidation = validateSessionJoin(session, currentCount)

  if (!joinValidation.isValid) {
    throw new Error(`Cannot join session: ${joinValidation.errors.join(", ")}`)
  }

  // Log warnings if any
  if (joinValidation.warnings.length > 0) {
    console.warn("[Session Join] Warnings:", joinValidation.warnings)
  }

  // Check if user is already a participant
  const { data: existingParticipant } = await supabase
    .from("session_participants")
    .select("id")
    .eq("session_id", session.id)
    .eq("user_id", userId)
    .single()

  if (!existingParticipant) {
    // Add user as participant
    const { error: joinError } = await supabase.from("session_participants").insert({
      session_id: session.id,
      user_id: userId,
      selected_language: selectedLanguage,
      is_active: true,
    })

    if (joinError) {
      console.error("Error joining session:", joinError)
      throw new Error("Failed to join session")
    }
  } else {
    // Update existing participant
    const { error: updateError } = await supabase
      .from("session_participants")
      .update({
        selected_language: selectedLanguage,
        is_active: true,
      })
      .eq("session_id", session.id)
      .eq("user_id", userId)

    if (updateError) {
      console.error("Error updating participant:", updateError)
      throw new Error("Failed to update session participation")
    }
  }

  return session
}

export async function getSessionServer(sessionId: string): Promise<Session | null> {
  const supabase = createServerSupabaseClient()

  const { data: session, error } = await supabase.from("sessions").select("*").eq("id", sessionId).single()

  if (error || !session) {
    return null
  }

  return session
}

export async function getSessionParticipantsServer(sessionId: string): Promise<SessionParticipant[]> {
  const supabase = createServerSupabaseClient()

  const { data: participants, error } = await supabase
    .from("session_participants")
    .select(`
      *,
      user:profiles!session_participants_user_id_fkey(
        id,
        full_name,
        email,
        role
      )
    `)
    .eq("session_id", sessionId)
    .eq("is_active", true)

  if (error) {
    console.error("Error fetching participants:", error)
    return []
  }

  return participants || []
}

export async function getUserSessionsServer(userId: string, role: string): Promise<Session[]> {
  const supabase = createServerSupabaseClient()

  let query = supabase.from("sessions").select("*").order("created_at", { ascending: false })

  if (role === "lecturer") {
    // Get sessions created by this lecturer
    query = query.eq("created_by", userId)
  } else {
    // Get sessions where user is a participant
    query = query.in(
      "id",
      supabase.from("session_participants").select("session_id").eq("user_id", userId).eq("is_active", true),
    )
  }

  const { data: sessions, error } = await query

  if (error) {
    console.error("Error fetching user sessions:", error)
    return []
  }

  return sessions || []
}

export async function updateSessionServer(
  sessionId: string,
  userId: string,
  updateData: UpdateSessionData,
): Promise<Session> {
  const supabase = createServerSupabaseClient()

  // Get current session
  const { data: currentSession, error: fetchError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .single()

  if (fetchError || !currentSession) {
    throw new Error("Session not found")
  }

  // Check if user is the session creator
  if (currentSession.created_by !== userId) {
    throw new Error("Only the session creator can update the session")
  }

  // Validate update data
  const validation = validateUpdateSessionData(currentSession, updateData)
  if (!validation.isValid) {
    throw new Error(`Validation failed: ${validation.errors.join(", ")}`)
  }

  // Log warnings if any
  if (validation.warnings.length > 0) {
    console.warn("[Session Update] Warnings:", validation.warnings)
  }

  // Update session
  const { data: updatedSession, error: updateError } = await supabase
    .from("sessions")
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq("id", sessionId)
    .select()
    .single()

  if (updateError) {
    console.error("Error updating session:", updateError)
    throw new Error("Failed to update session")
  }

  return updatedSession
}
