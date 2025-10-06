import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createSessionServer, type CreateSessionData } from '@/lib/session-service-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get the current user from Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      title, 
      description, 
      startTime, 
      originalLanguage, 
      availableLanguages, 
      mode, 
      paymentGoal 
    } = body as CreateSessionData

    // Validate required fields
    if (!title || !originalLanguage || !availableLanguages || !mode) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, originalLanguage, availableLanguages, mode' 
      }, { status: 400 })
    }

    // Validate languages array
    if (!Array.isArray(availableLanguages) || availableLanguages.length === 0) {
      return NextResponse.json({ 
        error: 'availableLanguages must be a non-empty array' 
      }, { status: 400 })
    }

    // Validate mode
    const validModes = ['classroom', 'conference', 'podcast', 'livestream']
    if (!validModes.includes(mode)) {
      return NextResponse.json({ 
        error: 'Invalid mode. Must be one of: classroom, conference, podcast, livestream' 
      }, { status: 400 })
    }

    // Create session
    const session = await createSessionServer({
      title,
      description,
      startTime,
      originalLanguage,
      availableLanguages,
      mode,
      paymentGoal,
    }, user.id)

    return NextResponse.json({ 
      success: true,
      session,
      message: 'Session created successfully' 
    })

  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}
