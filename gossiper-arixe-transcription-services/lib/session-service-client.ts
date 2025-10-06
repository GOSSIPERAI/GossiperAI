// Client-side session functions (for use in components)
// These functions make API calls to server endpoints

export interface CreateSessionData {
  title: string
  description?: string
  startTime?: string
  originalLanguage: string
  availableLanguages: string[]
  mode: 'classroom' | 'conference' | 'podcast' | 'livestream'
  paymentGoal?: number
}

export interface Session {
  id: string
  title: string
  description?: string
  code: string
  created_by: string
  start_time?: string
  end_time?: string
  status: 'scheduled' | 'active' | 'ended'
  original_language: string
  available_languages: string[]
  mode: 'classroom' | 'conference' | 'podcast' | 'livestream'
  payment_goal?: number
  created_at: string
  updated_at: string
  // Additional properties for UI compatibility
  lecturer?: string
  startTime?: string
  participants?: any[]
  paymentPool?: {
    goalAmount: number
    currentAmount: number
    contributions: number
  }
}

export interface SessionParticipant {
  id: string
  session_id: string
  user_id: string
  joined_at: string
  selected_language: string
  is_active: boolean
  user?: {
    id: string
    full_name: string
    email: string
    role: string
  }
}

export async function createSessionClient(data: CreateSessionData): Promise<{ session: Session; error?: string }> {
  try {
    const response = await fetch('/api/sessions/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      return { session: null as any, error: result.error || 'Failed to create session' }
    }

    return { session: result.session }
  } catch (error) {
    console.error('Error creating session:', error)
    return { session: null as any, error: 'Network error occurred' }
  }
}

export async function joinSessionClient(code: string, selectedLanguage: string = 'en'): Promise<{ session: Session; error?: string }> {
  try {
    const response = await fetch('/api/sessions/join', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, selectedLanguage }),
    })

    const result = await response.json()

    if (!response.ok) {
      return { session: null as any, error: result.error || 'Failed to join session' }
    }

    return { session: result.session }
  } catch (error) {
    console.error('Error joining session:', error)
    return { session: null as any, error: 'Network error occurred' }
  }
}

export async function getSessionClient(sessionId: string): Promise<{ session: Session | null; error?: string }> {
  try {
    const response = await fetch(`/api/sessions/${sessionId}`)
    const result = await response.json()

    if (!response.ok) {
      return { session: null, error: result.error || 'Failed to fetch session' }
    }

    return { session: result.session }
  } catch (error) {
    console.error('Error fetching session:', error)
    return { session: null, error: 'Network error occurred' }
  }
}

export async function getSessionParticipantsClient(sessionId: string): Promise<{ participants: SessionParticipant[]; error?: string }> {
  try {
    const response = await fetch(`/api/sessions/${sessionId}/participants`)
    const result = await response.json()

    if (!response.ok) {
      return { participants: [], error: result.error || 'Failed to fetch participants' }
    }

    return { participants: result.participants }
  } catch (error) {
    console.error('Error fetching participants:', error)
    return { participants: [], error: 'Network error occurred' }
  }
}
