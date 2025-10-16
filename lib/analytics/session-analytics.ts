/**
 * Session Analytics Utilities
 * Provides analytics calculation and aggregation for sessions
 */

import type { Session, SessionParticipant, SessionAnalytics } from "../types/session"

/**
 * Calculate session duration in minutes
 */
export function calculateSessionDuration(session: Session): number | null {
  if (!session.start_time || !session.end_time) {
    return null
  }

  const start = new Date(session.start_time)
  const end = new Date(session.end_time)
  const durationMs = end.getTime() - start.getTime()

  return Math.round(durationMs / 1000 / 60) // Convert to minutes
}

/**
 * Calculate participant engagement metrics
 */
export function calculateParticipantEngagement(participants: SessionParticipant[]) {
  return participants.map((participant) => {
    const joinTime = new Date(participant.joined_at)
    const leaveTime = participant.left_at ? new Date(participant.left_at) : new Date()
    const duration = Math.round((leaveTime.getTime() - joinTime.getTime()) / 1000 / 60) // minutes

    return {
      userId: participant.user_id,
      joinTime: participant.joined_at,
      leaveTime: participant.left_at,
      duration,
      selectedLanguage: participant.selected_language,
    }
  })
}

/**
 * Calculate language distribution across participants
 */
export function calculateLanguageDistribution(participants: SessionParticipant[]): Record<string, number> {
  const distribution: Record<string, number> = {}

  participants.forEach((participant) => {
    const lang = participant.selected_language
    distribution[lang] = (distribution[lang] || 0) + 1
  })

  return distribution
}

/**
 * Calculate average session duration for multiple sessions
 */
export function calculateAverageSessionDuration(sessions: Session[]): number {
  const durations = sessions
    .map((session) => calculateSessionDuration(session))
    .filter((duration): duration is number => duration !== null)

  if (durations.length === 0) return 0

  const total = durations.reduce((sum, duration) => sum + duration, 0)
  return Math.round(total / durations.length)
}

/**
 * Get session summary statistics
 */
export function getSessionSummaryStats(sessions: Session[]) {
  const totalSessions = sessions.length
  const activeSessions = sessions.filter((s) => s.status === "active").length
  const scheduledSessions = sessions.filter((s) => s.status === "scheduled").length
  const endedSessions = sessions.filter((s) => s.status === "ended").length
  const cancelledSessions = sessions.filter((s) => s.status === "cancelled").length

  return {
    total: totalSessions,
    active: activeSessions,
    scheduled: scheduledSessions,
    ended: endedSessions,
    cancelled: cancelledSessions,
    averageDuration: calculateAverageSessionDuration(sessions),
  }
}

/**
 * Generate session analytics report
 */
export function generateSessionAnalytics(
  session: Session,
  participants: SessionParticipant[],
  transcriptionCount = 0,
): SessionAnalytics {
  const activeParticipants = participants.filter((p) => p.is_active).length
  const languageDistribution = calculateLanguageDistribution(participants)
  const participantEngagement = calculateParticipantEngagement(participants)

  return {
    sessionId: session.id,
    totalParticipants: participants.length,
    activeParticipants,
    averageSessionDuration: calculateSessionDuration(session) || 0,
    totalTranscriptions: transcriptionCount,
    languageDistribution,
    participantEngagement,
    technicalMetrics: {
      averageLatency: 0, // Placeholder for future implementation
      transcriptionAccuracy: 0, // Placeholder for future implementation
      errorCount: 0, // Placeholder for future implementation
    },
  }
}
