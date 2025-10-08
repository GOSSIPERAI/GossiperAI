import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function POST(request: NextRequest) {
  try {
    const { walletAddress } = await request.json()

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Check if user exists with this wallet address
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'No account found with this wallet address. Please sign up first.' },
        { status: 404 }
      )
    }

    // Create a JWT token for wallet authentication
    const token = await new SignJWT({
      userId: profile.id,
      walletAddress: profile.wallet_address,
      role: profile.role,
      authMethod: 'wallet'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    // Return user data and token
    const response = NextResponse.json({
      user: {
        id: profile.id,
        email: profile.email,
        full_name: profile.name || profile.full_name || 'User',
        role: profile.role,
        wallet_address: profile.wallet_address,
        wallet_connected: true,
        auth_method: profile.auth_method || 'wallet'
      },
      token
    })

    // Set the token as an HTTP-only cookie
    response.cookies.set('wallet-auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Error in wallet signin:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
