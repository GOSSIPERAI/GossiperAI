import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { createServerSupabaseClient } from '@/lib/supabase-server'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)
export const dynamic = 'force-dynamic'; // Ensure the route is always dynamic
export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('wallet-auth-token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      )
    }

    // Verify the JWT token
    const { payload } = await jwtVerify(token, JWT_SECRET)

    if (!payload.userId || !payload.walletAddress) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', payload.userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.name || profile.full_name || 'User',
        role: profile.role,
        wallet_address: profile.wallet_address,
        wallet_connected: true,
        auth_method: profile.auth_method || 'wallet'
      }
    })
  } catch (error) {
    console.error('Error verifying wallet token:', error)
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    )
  }
}
