import { NextResponse } from 'next/server';
import { getCurrentUser, disconnectWalletFromUser } from '@/lib/auth';

export async function POST() {
  try {
    // Get authenticated user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    if (!user.wallet_address) {
      return NextResponse.json(
        { error: 'No wallet connected to your account' },
        { status: 400 }
      );
    }

    // Disconnect wallet
    const updatedUser = await disconnectWalletFromUser(user.id);

    return NextResponse.json({
      success: true,
      message: 'Wallet disconnected successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        display_name: updatedUser.display_name,
        wallet_address: updatedUser.wallet_address,
        wallet_connected_at: updatedUser.wallet_connected_at,
      },
    });
  } catch (error) {
    console.error('Disconnect wallet error:', error);
    return NextResponse.json(
      { error: 'An error occurred while disconnecting wallet' },
      { status: 500 }
    );
  }
}

