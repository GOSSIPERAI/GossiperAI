import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      startTime,
      originalLanguage,
      availableLanguages,
      mode,
      paymentGoal,
      enablePayments,
    } = body;

    // Validation
    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!availableLanguages || availableLanguages.length === 0) {
      return NextResponse.json(
        { error: 'At least one language is required' },
        { status: 400 }
      );
    }

    // Generate unique 6-character join code
    const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Insert session into database
    const result = await query(
      `INSERT INTO sessions (
        creator_id, title, description, join_code, original_language,
        available_languages, mode, start_time, payment_enabled, payment_goal
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id, title, description, join_code, original_language, available_languages,
                mode, status, start_time, payment_enabled, payment_goal, created_at`,
      [
        user.id,
        title.trim(),
        description?.trim() || null,
        joinCode,
        originalLanguage || 'en',
        availableLanguages,
        mode || 'classroom',
        startTime ? new Date(startTime) : new Date(),
        enablePayments !== undefined ? enablePayments : true,
        paymentGoal || 50,
      ]
    );

    const session = result.rows[0];

    // Also add creator as first participant
    await query(
      `INSERT INTO session_participants (session_id, user_id, selected_language)
       VALUES ($1, $2, $3)`,
      [session.id, user.id, originalLanguage || 'en']
    );

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
        paymentEnabled: session.payment_enabled,
        paymentGoal: session.payment_goal,
        createdAt: session.created_at,
        creatorId: user.id,
        creatorName: user.display_name || user.username,
      },
    });
  } catch (error: any) {
    console.error('Create session error:', error);
    
    // Handle duplicate join code (extremely rare)
    if (error.code === '23505' && error.constraint === 'sessions_join_code_key') {
      return NextResponse.json(
        { error: 'Failed to generate unique code. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create session. Please try again.' },
      { status: 500 }
    );
  }
}

