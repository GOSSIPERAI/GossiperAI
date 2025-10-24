import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { sessionId, selectedLanguage } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Check if session exists
    const sessionCheck = await query(
      `SELECT id, status, creator_id FROM sessions WHERE id = $1`,
      [sessionId]
    );

    if (sessionCheck.rows.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const session = sessionCheck.rows[0];

    // Check if already joined
    const participantCheck = await query(
      `SELECT id FROM session_participants WHERE session_id = $1 AND user_id = $2`,
      [sessionId, user.id]
    );

    if (participantCheck.rows.length > 0) {
      // Already joined, just return success
      return NextResponse.json({
        success: true,
        message: 'Already joined this session',
        sessionId: sessionId,
      });
    }

    // Add user as participant
    await query(
      `INSERT INTO session_participants (session_id, user_id, selected_language)
       VALUES ($1, $2, $3)`,
      [sessionId, user.id, selectedLanguage || 'en']
    );

    return NextResponse.json({
      success: true,
      message: 'Successfully joined session',
      sessionId: sessionId,
    });
  } catch (error: any) {
    console.error('Join session error:', error);
    return NextResponse.json(
      { error: 'Failed to join session' },
      { status: 500 }
    );
  }
}

