# Email/Password Authentication Setup

## Overview

Gossiper now supports email/password authentication as the primary authentication method. Users can optionally connect their wallet from the dashboard after signing in.

## Database Setup

### 1. Connection String

Update your `.env.local` file with your database connection string:

```env
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
JWT_SECRET=your-super-secret-jwt-key-change-this
```

**Generate a secure JWT secret:**
```bash
openssl rand -base64 32
```

### 2. Initialize Database

Run the SQL schema to create tables:

```bash
# Option 1: Using the init script (requires working DB connection)
pnpm tsx scripts/init-db.ts

# Option 2: Manual - Copy SQL from lib/auth-schema.sql and run it in your database client
```

The schema creates two tables:
- `users` - Stores user credentials and profile info
- `sessions` - Stores authentication tokens

### 3. Database Schema

```sql
users (
  id UUID PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash TEXT,
  display_name VARCHAR(100),
  wallet_address VARCHAR(66) UNIQUE,  -- Optional, added after login
  wallet_connected_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  email_verified BOOLEAN,
  last_login TIMESTAMP
)

sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  token TEXT UNIQUE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP
)
```

## Authentication Flow

### Sign Up
1. User visits `/signup`
2. Enters: username, email, password, display name (optional)
3. API validates input and creates user with bcrypt-hashed password
4. JWT token set in httpOnly cookie
5. Redirect to `/dashboard`

### Sign In
1. User visits `/login`
2. Enters: email, password
3. API verifies credentials
4. JWT token set in httpOnly cookie
5. Redirect to `/dashboard`

### Sign Out
1. User clicks "Sign Out"
2. API clears auth cookie
3. Redirect to home page

### Wallet Connection (Optional)
1. User navigates to dashboard
2. Clicks "Connect Wallet"
3. Wallet modal appears (Phantom, MetaMask, etc.)
4. User confirms connection
5. API stores wallet address with user account
6. Wallet can now be used for payments

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/signup` | POST | Create new user account |
| `/api/auth/signin` | POST | Sign in with email/password |
| `/api/auth/signout` | POST | Sign out and clear cookie |
| `/api/auth/me` | GET | Get current user info |
| `/api/auth/wallet/connect` | POST | Connect wallet to account |
| `/api/auth/wallet/disconnect` | POST | Disconnect wallet from account |

## Usage in Components

### Using the Auth Hook

```tsx
import { useAuth } from '@/hooks/use-auth';

function MyComponent() {
  const { user, loading, signIn, signOut, connectWallet } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!user) {
    return <button onClick={() => signIn(email, password)}>Sign In</button>;
  }
  
  return (
    <div>
      <p>Welcome, {user.display_name}!</p>
      <p>Email: {user.email}</p>
      {user.wallet_address ? (
        <p>Wallet: {user.wallet_address}</p>
      ) : (
        <button onClick={() => connectWallet(address)}>Connect Wallet</button>
      )}
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
}
```

### Protected Routes

The auth system automatically redirects unauthenticated users on protected pages (dashboard, create-session, etc.).

## Security Features

- **Password Hashing:** bcrypt with salt rounds = 10
- **JWT Tokens:** 7-day expiry, httpOnly cookies
- **HTTPS Only:** Secure cookies in production
- **Input Validation:**
  - Email format validation
  - Username: 3-50 chars, alphanumeric + hyphens/underscores
  - Password: Min 8 chars, must contain letters and numbers
- **Unique Constraints:** Email and username must be unique
- **Wallet Validation:** Ethereum address format (0x + 40 hex chars)

## Troubleshooting

### Database Connection Timeout

If you're getting connection timeouts:

1. Check your `DATABASE_URL` is correct
2. Ensure your IP is whitelisted (for cloud databases like Neon)
3. Verify SSL/TLS settings
4. Test connection with a database client first

### "Invalid email or password"

- Check email is correct (case-sensitive)
- Verify password meets requirements
- Ensure user exists in database

### Wallet Already Connected

Each wallet can only be linked to one account. To connect a wallet to a different account:
1. Disconnect from current account
2. Sign in to new account
3. Connect wallet

## Migration from Wallet-Only Auth

If you have existing users with wallet-only auth:

```sql
-- Add email/username to existing wallet users
UPDATE users 
SET 
  email = CONCAT(SUBSTRING(wallet_address, 3, 8), '@gossiper.temp'),
  username = CONCAT('user_', SUBSTRING(wallet_address, 3, 8)),
  password_hash = '$2b$10$...'  -- Generate default hash
WHERE email IS NULL;
```

Then prompt users to update their credentials on first login.

## Next Steps

1. ✅ Database schema created
2. ✅ Authentication API routes
3. ✅ Login/Signup pages
4. ✅ Auth hook for client-side state
5. 🔄 Update dashboard to use email auth
6. 🔄 Add wallet connection UI in dashboard
7. 🔄 Test full authentication flow


