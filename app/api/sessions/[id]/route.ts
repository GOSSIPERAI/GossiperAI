import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getSessionServer } from '@/lib/session-service-server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get the current user from Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const sessionId = params.id

    if (!sessionId) {
      return NextResponse.json({ 
        error: 'Session ID is required' 
      }, { status: 400 })
    }

    // Get session
    const session = await getSessionServer(sessionId)

    if (!session) {
      return NextResponse.json({ 
        error: 'Session not found' 
      }, { status: 404 })
    }

    // Check if user has access to this session
    // Either they created it (lecturer) or they're a participant
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'lecturer' && session.created_by !== user.id) {
      // Lecturer trying to access someone else's session - check if they're a participant
      const { data: participant } = await supabase
        .from('session_participants')
        .select('id')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()

      if (!participant) {
        return NextResponse.json({ 
          error: 'Access denied. You are not authorized to view this session.' 
        }, { status: 403 })
      }
    }

    return NextResponse.json({ 
      success: true,
      session 
    })

  } catch (error) {
    console.error('Error fetching session:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}
