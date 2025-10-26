import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const sessionId = params.id;

    // Get session details with creator info
    const result = await query(
      `SELECT * FROM session_details WHERE id = $1`,
      [sessionId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    const session = result.rows[0];

    // Check if current user is a participant
    const participantCheck = await query(
      `SELECT * FROM session_participants WHERE session_id = $1 AND user_id = $2`,
      [sessionId, user.id]
    );

    const isParticipant = participantCheck.rows.length > 0;
    const isCreator = session.creator_id === user.id;

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        title: session.title,
        description: session.description,
        joinCode: session.join_code,
        originalLanguage: session.original_language,
        availableLanguages: session.available_languages,
        mode: session.mode,
        status: session.status,
        startTime: session.start_time,
        endTime: session.end_time,
        paymentEnabled: session.payment_enabled,
        paymentGoal: session.payment_goal,
        paymentCurrency: session.payment_currency,
        createdAt: session.created_at,
        creatorId: session.creator_id,
        creatorName: session.creator_name,
        creatorUsername: session.creator_username,
        participantCount: parseInt(session.participant_count),
      },
      userRole: isCreator ? 'lecturer' : (isParticipant ? 'student' : null),
    });
  } catch (error: any) {
    console.error('Get session error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

