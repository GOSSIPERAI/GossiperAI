# Wallet Authentication Setup Guide

This guide explains how to set up and use the wallet authentication feature in GossiperAI.

## Overview

The wallet authentication system allows users to sign in using their Solana wallet (Phantom, Solflare, etc.) instead of email/password. Users can:
- Sign up with just their wallet
- Sign in with their wallet
- Access the dashboard after wallet authentication
- Use both email and wallet authentication methods

## Architecture

### Components

1. **Database Layer** (`supabase-migrations/001_wallet_auth.sql`)
   - Adds wallet-related columns to profiles table
   - Creates functions for wallet user management
   - Supports both email and wallet authentication methods

2. **API Endpoints** (`app/api/auth/wallet/`)
   - `/api/auth/wallet/signin` - Sign in with wallet
   - `/api/auth/wallet/signup` - Create account with wallet
   - `/api/auth/wallet/verify` - Verify wallet authentication token

3. **Auth Hook** (`hooks/use-auth.tsx`)
   - `signInWithWallet()` - Authenticate with wallet address
   - `signUpWithWallet()` - Create account with wallet address
   - Automatic account creation on first wallet connection

4. **Middleware** (`middleware.ts`)
   - Checks both Supabase auth and wallet JWT tokens
   - Protects routes for authenticated users only

5. **Updated `/api/auth/me` route**
   - Returns user data for both email and wallet authenticated users

## Setup Instructions

### 1. Database Migration

Run the SQL migration to add wallet support to your database:

```bash
# Connect to your Supabase project and run:
psql -h <your-supabase-host> -U postgres -d postgres -f supabase-migrations/001_wallet_auth.sql
```

Or use the Supabase dashboard:
1. Go to SQL Editor
2. Copy the contents of `supabase-migrations/001_wallet_auth.sql`
3. Run the migration

### 2. Environment Variables

Add the following to your `.env.local` file:

```env
# Existing Supabase variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# New: JWT secret for wallet authentication
JWT_SECRET=your_secure_random_secret_key_here
```

**Important:** Generate a strong JWT_SECRET:
```bash
# On Linux/Mac
openssl rand -base64 32

# On Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 3. Install Dependencies

The required dependencies are already in package.json:
- `jose` - For JWT token handling
- `@solana/wallet-adapter-react` - Wallet integration
- `@solana/wallet-adapter-wallets` - Wallet adapters

If needed, install them:
```bash
npm install jose @solana/wallet-adapter-react @solana/wallet-adapter-wallets
```

### 4. Test the Implementation

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/login` or `/signup`

3. Connect your Solana wallet (Phantom or Solflare)

4. The system will automatically:
   - Create an account if it's your first time
   - Sign you in if you already have an account
   - Redirect you to the dashboard

## How It Works

### Authentication Flow

#### First-Time Wallet User:
1. User clicks "Connect Wallet" on login/signup page
2. Wallet extension prompts for connection
3. Frontend calls `/api/auth/wallet/signin` with wallet address
4. API checks if wallet exists in database
5. If not found, automatically calls `/api/auth/wallet/signup`
6. New profile created with wallet address
7. JWT token generated and set as HTTP-only cookie
8. User redirected to dashboard

#### Returning Wallet User:
1. User connects wallet
2. Frontend calls `/api/auth/wallet/signin`
3. API finds existing profile
4. JWT token generated and set as cookie
5. User redirected to dashboard

### Security Features

- **HTTP-Only Cookies**: Wallet auth tokens stored securely
- **JWT Verification**: Tokens verified on every request
- **7-Day Expiration**: Tokens expire after 7 days
- **Middleware Protection**: All protected routes check for valid authentication
- **No Password Storage**: Wallet users don't need passwords

### Database Schema

The migration adds these columns to the `profiles` table:

```sql
wallet_address TEXT UNIQUE        -- Solana wallet address
wallet_connected BOOLEAN          -- Whether wallet is connected
auth_method TEXT                  -- 'email', 'wallet', or 'both'
```

## API Reference

### POST /api/auth/wallet/signin

Sign in with wallet address.

**Request:**
```json
{
  "walletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU"
}
```

**Response (Success):**
```json
{
  "user": {
    "id": "uuid",
    "email": "7xKXtg2C@wallet.gossiper.ai",
    "full_name": "User_7xKXtg2C",
    "role": "student",
    "wallet_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "wallet_connected": true,
    "auth_method": "wallet"
  },
  "token": "jwt_token_here"
}
```

**Response (Not Found):**
```json
{
  "error": "No account found with this wallet address. Please sign up first."
}
```

### POST /api/auth/wallet/signup

Create account with wallet address.

**Request:**
```json
{
  "walletAddress": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  "name": "John Doe",
  "role": "student"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "7xKXtg2C@wallet.gossiper.ai",
    "full_name": "John Doe",
    "role": "student",
    "wallet_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "wallet_connected": true,
    "auth_method": "wallet"
  },
  "token": "jwt_token_here"
}
```

### GET /api/auth/wallet/verify

Verify wallet authentication token.

**Headers:**
```
Cookie: wallet-auth-token=jwt_token_here
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "7xKXtg2C@wallet.gossiper.ai",
    "full_name": "John Doe",
    "role": "student",
    "wallet_address": "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    "wallet_connected": true,
    "auth_method": "wallet"
  }
}
```

## Troubleshooting

### Wallet Not Connecting
- Ensure wallet extension is installed (Phantom or Solflare)
- Check browser console for errors
- Try refreshing the page

### Authentication Fails
- Verify JWT_SECRET is set in environment variables
- Check database migration was applied successfully
- Ensure wallet address is valid Solana address

### User Can't Access Dashboard
- Check middleware logs in browser console
- Verify wallet-auth-token cookie is set
- Try signing out and signing in again

## Future Enhancements

Potential improvements:
- Wallet signature verification for enhanced security
- Support for additional wallet types (Ethereum, etc.)
- Linking multiple wallets to one account
- Wallet-based transaction signing
- NFT-gated access features

## Support

For issues or questions:
1. Check the browser console for error messages
2. Review the middleware logs
3. Verify database schema matches migration
4. Ensure all environment variables are set correctly
