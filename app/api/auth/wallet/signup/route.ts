import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export async function POST(request: NextRequest) {
  try {
    const { walletAddress, name, role } = await request.json()

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    const supabase = createServerSupabaseClient()

    // Check if wallet already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single()

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Wallet address already registered' },
        { status: 409 }
      )
    }

    // Create new profile with wallet
    const userId = crypto.randomUUID()
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        wallet_address: walletAddress,
        name: name || `User_${walletAddress.slice(0, 8)}`,
        role: role || 'student',
        email: `${walletAddress.slice(0, 8)}@wallet.gossiper.ai`,
        wallet_connected: true,
        auth_method: 'wallet',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating wallet user:', insertError)
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      )
    }

    // Create a JWT token for wallet authentication
    const token = await new SignJWT({
      userId: newProfile.id,
      walletAddress: newProfile.wallet_address,
      role: newProfile.role,
      authMethod: 'wallet'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(JWT_SECRET)

    // Return user data and token
    const response = NextResponse.json({
      user: {
        id: newProfile.id,
        email: newProfile.email,
        full_name: newProfile.name || 'User',
        role: newProfile.role,
        wallet_address: newProfile.wallet_address,
        wallet_connected: true,
        auth_method: 'wallet'
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
    console.error('Error in wallet signup:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
