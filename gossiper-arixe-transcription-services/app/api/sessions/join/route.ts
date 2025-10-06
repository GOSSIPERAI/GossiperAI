import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { joinSessionServer } from '@/lib/session-service-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient()
    
    // Get the current user from Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { code, selectedLanguage = 'en' } = body

    // Validate required fields
    if (!code) {
      return NextResponse.json({ 
        error: 'Session code is required' 
      }, { status: 400 })
    }

    // Validate code format (6 characters, alphanumeric)
    if (!/^[A-Z0-9]{6}$/.test(code.toUpperCase())) {
      return NextResponse.json({ 
        error: 'Invalid session code format. Must be 6 alphanumeric characters.' 
      }, { status: 400 })
    }

    // Join session
    const session = await joinSessionServer(code.toUpperCase(), user.id, selectedLanguage)

    return NextResponse.json({ 
      success: true,
      session,
      message: 'Successfully joined session' 
    })

  } catch (error) {
    console.error('Error joining session:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 })
  }
}
