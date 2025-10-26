-- Gossiper Email/Password Authentication Schema with Wallet Support
-- Drop existing tables if they exist (for fresh start)
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Users table for email/password authentication + optional wallet
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name VARCHAR(100),
  
  -- Wallet integration (optional, added after login)
  wallet_address VARCHAR(66) UNIQUE, -- Base/Ethereum address (0x... up to 66 chars)
  wallet_connected_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  email_verified BOOLEAN DEFAULT FALSE,
  last_login TIMESTAMP,
  
  -- Constraints
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT username_length CHECK (LENGTH(username) >= 3),
  CONSTRAINT username_format CHECK (username ~* '^[a-zA-Z0-9_-]+$')
);

-- Sessions table for authentication tokens
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  user_agent TEXT,
  ip_address INET
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- View for safe user info (without password hash)
CREATE OR REPLACE VIEW user_info AS
SELECT 
  id,
  username,
  email,
  display_name,
  wallet_address,
  wallet_connected_at,
  created_at,
  updated_at,
  email_verified,
  last_login
FROM users;

COMMENT ON TABLE users IS 'Stores user authentication and profile information with optional wallet linking';
COMMENT ON TABLE sessions IS 'Server-side session storage for authentication tokens';
COMMENT ON COLUMN users.password_hash IS 'bcrypt hashed password - never expose this field to clients';
COMMENT ON COLUMN users.wallet_address IS 'Optional Base/Ethereum wallet address linked to user account';
COMMENT ON COLUMN sessions.token IS 'Secure random token for session validation';
