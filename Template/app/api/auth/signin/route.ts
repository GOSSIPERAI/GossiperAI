import { NextRequest, NextResponse } from 'next/server';
import {
  findUserByEmail,
  verifyPassword,
  setAuthCookie,
  updateUserLastLogin,
  validateEmail,
} from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Find user
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    await updateUserLastLogin(user.id);

    // Set auth cookie
    await setAuthCookie(user);

    // Return user data (without sensitive info)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        display_name: user.display_name,
        wallet_address: user.wallet_address,
        wallet_connected_at: user.wallet_connected_at,
        last_login: new Date(),
      },
    });
  } catch (error: any) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signin. Please try again.' },
      { status: 500 }
    );
  }
}

