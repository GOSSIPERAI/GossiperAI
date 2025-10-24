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
    const { joinCode } = body;

    if (!joinCode || joinCode.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid join code format' },
        { status: 400 }
      );
    }

    // Find session by join code
    const result = await query(
      `SELECT * FROM session_details WHERE join_code = $1`,
      [joinCode.toUpperCase()]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Session not found. Please check the code and try again.' },
        { status: 404 }
      );
    }

    const session = result.rows[0];

    // Check if session is active or scheduled
    if (session.status === 'ended' || session.status === 'cancelled') {
      return NextResponse.json(
        { error: `This session has ${session.status}. Please contact the host.` },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        title: session.title,
        description: session.description,
        creatorName: session.creator_name || session.creator_username,
        startTime: session.start_time,
        mode: session.mode,
        participantCount: parseInt(session.participant_count),
        availableLanguages: session.available_languages,
        originalLanguage: session.original_language,
      },
    });
  } catch (error: any) {
    console.error('Validate join code error:', error);
    return NextResponse.json(
      { error: 'Failed to validate session code' },
      { status: 500 }
    );
  }
}

