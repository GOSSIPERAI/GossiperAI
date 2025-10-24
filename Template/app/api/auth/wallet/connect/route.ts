import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, connectWalletToUser } from '@/lib/auth';

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
    const { walletAddress } = body;

    // Validation
    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // EVM address validation (Base/Ethereum format: 0x followed by 40 hex chars)
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format. Please provide a valid EVM address (0x...)' },
        { status: 400 }
      );
    }

    // Check if user already has this wallet
    if (user.wallet_address === walletAddress) {
      return NextResponse.json(
        { error: 'This wallet is already connected to your account' },
        { status: 400 }
      );
    }

    // Connect wallet
    const updatedUser = await connectWalletToUser(user.id, walletAddress);

    return NextResponse.json({
      success: true,
      message: 'Wallet connected successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        display_name: updatedUser.display_name,
        wallet_address: updatedUser.wallet_address,
        wallet_connected_at: updatedUser.wallet_connected_at,
      },
    });
  } catch (error: any) {
    console.error('Connect wallet error:', error);
    
    if (error.message === 'This wallet is already connected to another account') {
      return NextResponse.json(
        { error: error.message },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'An error occurred while connecting wallet' },
      { status: 500 }
    );
  }
}

