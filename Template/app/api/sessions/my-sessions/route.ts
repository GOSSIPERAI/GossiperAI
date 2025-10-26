import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get sessions created by the user
    const createdSessions = await query(
      `SELECT 
        s.*,
        u.username as creator_username,
        u.display_name as creator_name,
        (SELECT COUNT(*) FROM session_participants WHERE session_id = s.id) as participant_count
       FROM sessions s
       JOIN users u ON s.creator_id = u.id
       WHERE s.creator_id = $1
       ORDER BY s.created_at DESC`,
      [user.id]
    );

    // Get sessions the user has joined (but didn't create)
    const joinedSessions = await query(
      `SELECT 
        s.*,
        u.username as creator_username,
        u.display_name as creator_name,
        sp.selected_language,
        sp.has_contributed,
        sp.joined_at,
        (SELECT COUNT(*) FROM session_participants WHERE session_id = s.id) as participant_count
       FROM session_participants sp
       JOIN sessions s ON sp.session_id = s.id
       JOIN users u ON s.creator_id = u.id
       WHERE sp.user_id = $1 AND s.creator_id != $1
       ORDER BY sp.joined_at DESC`,
      [user.id]
    );

    // Calculate stats
    const totalCreated = createdSessions.rows.length;
    const totalJoined = joinedSessions.rows.length;
    
    // Calculate total hours (mock for now - would need session end times)
    const totalHours = (totalCreated + totalJoined) * 2.5; // Estimate 2.5 hours per session
    
    // Calculate total contributions (from session_participants)
    const contributionsResult = await query(
      `SELECT COALESCE(SUM(contribution_amount), 0) as total
       FROM session_participants
       WHERE user_id = $1`,
      [user.id]
    );
    const totalContributions = parseFloat(contributionsResult.rows[0].total || 0);

    // Get most used language
    const languageResult = await query(
      `SELECT selected_language, COUNT(*) as count
       FROM session_participants
       WHERE user_id = $1
       GROUP BY selected_language
       ORDER BY count DESC
       LIMIT 1`,
      [user.id]
    );
    const favoriteLanguage = languageResult.rows[0]?.selected_language || 'English';

    return NextResponse.json({
      success: true,
      data: {
        createdSessions: createdSessions.rows.map(row => ({
          id: row.id,
          title: row.title,
          description: row.description,
          status: row.status,
          joinCode: row.join_code,
          creatorName: row.creator_name || row.creator_username,
          participantCount: parseInt(row.participant_count),
          startTime: row.start_time,
          createdAt: row.created_at,
          paymentGoal: parseFloat(row.payment_goal),
          paymentEnabled: row.payment_enabled,
          mode: row.mode,
          availableLanguages: row.available_languages,
        })),
        joinedSessions: joinedSessions.rows.map(row => ({
          id: row.id,
          title: row.title,
          description: row.description,
          status: row.status,
          joinCode: row.join_code,
          creatorName: row.creator_name || row.creator_username,
          participantCount: parseInt(row.participant_count),
          startTime: row.start_time,
          joinedAt: row.joined_at,
          selectedLanguage: row.selected_language,
          hasContributed: row.has_contributed,
          paymentGoal: parseFloat(row.payment_goal),
          mode: row.mode,
          availableLanguages: row.available_languages,
        })),
        stats: {
          totalCreatedSessions: totalCreated,
          totalJoinedSessions: totalJoined,
          totalHours: Math.round(totalHours * 10) / 10, // Round to 1 decimal
          totalContributions: totalContributions,
          favoriteLanguage: favoriteLanguage,
        },
      },
    });
  } catch (error: any) {
    console.error('Get my sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

