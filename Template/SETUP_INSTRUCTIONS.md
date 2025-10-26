# 🚀 Gossiper Auth Setup Instructions

## ✅ What's Been Implemented

### 1. **Database Schema** (`lib/auth-schema.sql`)
- Users table with email/password and optional wallet address
- Sessions table for token management
- Indexes for performance
- Constraints for data integrity

### 2. **Backend API Routes** (`app/api/auth/`)
- ✅ `POST /api/auth/signup` - User registration
- ✅ `POST /api/auth/signin` - User login
- ✅ `POST /api/auth/signout` - User logout
- ✅ `GET /api/auth/me` - Get current user
- ✅ `POST /api/auth/wallet/connect` - Link wallet to account
- ✅ `POST /api/auth/wallet/disconnect` - Unlink wallet

### 3. **Authentication Library** (`lib/auth.ts`)
- Password hashing with bcrypt
- JWT token generation/verification
- User CRUD operations
- Wallet connection management
- Input validation

### 4. **Frontend Components**
- ✅ `/signup` - Beautiful signup form with username, email, password
- ✅ `/login` - Login form with email/password
- ✅ `useAuth` hook - React context for auth state management
- ✅ AuthProvider wrapped in app layout

### 5. **Security Features**
- bcrypt password hashing (10 salt rounds)
- JWT tokens in httpOnly cookies
- Email/username uniqueness validation
- Password strength requirements
- CSRF protection via SameSite cookies

## 📋 Setup Steps

### Step 1: Install Dependencies (Already Done ✅)
```bash
pnpm add bcryptjs jsonwebtoken cookie
```

### Step 2: Configure Environment Variables

Create `.env.local` in the root directory:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_jzB07dxYqOnv@ep-still-snowflake-a4hy02a6-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Initialize Database

**Option A: Auto-run script** (if DB connection works)
```bash
pnpm tsx scripts/init-db.ts
```

**Option B: Manual SQL execution** (if connection timeout occurs)
1. Open your Neon dashboard: https://neon.tech/dashboard
2. Navigate to your database
3. Open SQL Editor
4. Copy contents of `lib/auth-schema.sql`
5. Paste and execute

### Step 4: Start Development Server
```bash
pnpm dev
```

Visit: http://localhost:3000

## 🧪 Testing the Authentication Flow

### Test 1: Sign Up
1. Go to http://localhost:3000/signup
2. Fill in form:
   - Username: `testuser`
   - Email: `test@example.com`
   - Display Name: `Test User`
   - Password: `password123`
   - Confirm Password: `password123`
3. Click "Create account"
4. Should redirect to `/dashboard`

### Test 2: Sign Out
1. From dashboard, click "Sign Out" or "Disconnect"
2. Should redirect to home page
3. Visit `/dashboard` - should be redirected to login

### Test 3: Sign In
1. Go to http://localhost:3000/login
2. Enter credentials:
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Sign in"
4. Should redirect to `/dashboard`

### Test 4: Connect Wallet (From Dashboard)
1. Sign in to dashboard
2. Click "Connect Wallet" button
3. Select wallet (Phantom/MetaMask/etc.)
4. Approve connection
5. Wallet address should be saved to your account

### Test 5: API Endpoints
```bash
# Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser2","email":"test2@example.com","password":"password123"}'

# Sign in
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test2@example.com","password":"password123"}' \
  -c cookies.txt

# Get current user
curl http://localhost:3000/api/auth/me -b cookies.txt

# Sign out
curl -X POST http://localhost:3000/api/auth/signout -b cookies.txt
```

## 🔍 Troubleshooting

### Issue: Database Connection Timeout

**Symptoms:** `Connection terminated due to connection timeout`

**Solutions:**
1. **Check IP whitelist** in Neon dashboard
2. **Try direct connection** via psql:
   ```bash
   psql postgresql://neondb_owner:npg_jzB07dxYqOnv@ep-still-snowflake-a4hy02a6-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
3. **Manual schema setup** (see Step 3, Option B above)
4. **Check Neon status**: https://neon.tech/status

### Issue: "Email already registered"

**Solution:** Email must be unique. Try:
- Different email address
- Delete existing user from database
- Reset database and start fresh

### Issue: JWT token errors

**Solution:**
- Ensure `JWT_SECRET` is set in `.env.local`
- Secret must be at least 32 characters
- Restart dev server after adding env variables

### Issue: Password validation fails

**Requirements:**
- Minimum 8 characters
- At least one letter
- At least one number

### Issue: Wallet connection fails

**Checklist:**
- User must be signed in first
- Wallet must be valid Ethereum address (0x...)
- Wallet can't be connected to another account

## 📁 File Structure

```
gossiper/
├── lib/
│   ├── auth.ts                 # Auth utilities & functions
│   ├── auth-schema.sql         # Database schema
│   └── db.ts                   # PostgreSQL connection
├── app/
│   ├── api/
│   │   └── auth/
│   │       ├── signup/route.ts
│   │       ├── signin/route.ts
│   │       ├── signout/route.ts
│   │       ├── me/route.ts
│   │       └── wallet/
│   │           ├── connect/route.ts
│   │           └── disconnect/route.ts
│   ├── login/page.tsx          # Login form
│   ├── signup/page.tsx         # Signup form
│   ├── dashboard/page.tsx      # Protected dashboard
│   └── layout.tsx              # AuthProvider wrapper
├── hooks/
│   └── use-auth.ts             # Auth context & hooks
└── scripts/
    ├── test-db.ts              # Database test script
    └── init-db.ts              # Database initialization
```

## 🎯 Next Steps

### Immediate
- [ ] Run `pnpm tsx scripts/init-db.ts` or manually execute SQL
- [ ] Add `JWT_SECRET` to `.env.local`
- [ ] Test signup/login flow
- [ ] Update dashboard to show wallet connection option

### Future Enhancements
- [ ] Email verification
- [ ] Password reset functionality
- [ ] OAuth providers (Google, GitHub)
- [ ] Two-factor authentication
- [ ] Session management UI
- [ ] Account settings page

## 📊 Database Verification

Check if schema was created successfully:

```sql
-- List all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- View users table structure
\d users

-- Count users
SELECT COUNT(*) FROM users;

-- View recent users
SELECT username, email, created_at, wallet_address 
FROM users 
ORDER BY created_at DESC 
LIMIT 5;
```

## 🔐 Security Notes

1. **JWT_SECRET**: MUST be different in production
2. **HTTPS**: Required for production (cookies marked Secure)
3. **Password Policy**: Enforce strong passwords
4. **Rate Limiting**: Add rate limiting to auth endpoints
5. **Email Verification**: Implement before production
6. **Audit Logs**: Track auth events for security

## 📞 Support

If you encounter issues:
1. Check `README_AUTH.md` for detailed documentation
2. Review error messages in terminal
3. Check browser console for client-side errors
4. Verify database connection string
5. Ensure all environment variables are set

---

**Status**: ✅ Backend complete | ✅ Frontend complete | 🔄 DB setup pending | 🔄 Testing pending

