-- Migration for wallet authentication support
-- This adds support for wallet-only authentication alongside email/password auth

-- Add wallet-related columns to profiles table if they don't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS wallet_address TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS wallet_connected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS auth_method TEXT DEFAULT 'email' CHECK (auth_method IN ('email', 'wallet', 'both'));

-- Create index for faster wallet address lookups
CREATE INDEX IF NOT EXISTS idx_profiles_wallet_address ON profiles(wallet_address);

-- Create a function to handle wallet-only user creation
CREATE OR REPLACE FUNCTION create_wallet_user(
  p_wallet_address TEXT,
  p_name TEXT,
  p_role TEXT DEFAULT 'student'
)
RETURNS TABLE (
  id UUID,
  wallet_address TEXT,
  name TEXT,
  role TEXT,
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Check if wallet already exists
  IF EXISTS (SELECT 1 FROM profiles WHERE profiles.wallet_address = p_wallet_address) THEN
    RAISE EXCEPTION 'Wallet address already registered';
  END IF;

  -- Generate a new UUID for the user
  v_user_id := gen_random_uuid();

  -- Insert into profiles table
  INSERT INTO profiles (id, wallet_address, name, role, email, wallet_connected, auth_method, created_at, updated_at)
  VALUES (
    v_user_id,
    p_wallet_address,
    p_name,
    p_role,
    p_wallet_address || '@wallet.gossiper.ai', -- Synthetic email for wallet users
    TRUE,
    'wallet',
    NOW(),
    NOW()
  )
  RETURNING 
    profiles.id,
    profiles.wallet_address,
    profiles.name,
    profiles.role,
    profiles.created_at
  INTO 
    id,
    wallet_address,
    name,
    role,
    created_at;

  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to link wallet to existing email user
CREATE OR REPLACE FUNCTION link_wallet_to_user(
  p_user_id UUID,
  p_wallet_address TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if wallet is already linked to another user
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE wallet_address = p_wallet_address 
    AND id != p_user_id
  ) THEN
    RAISE EXCEPTION 'Wallet address already linked to another account';
  END IF;

  -- Update the user profile
  UPDATE profiles
  SET 
    wallet_address = p_wallet_address,
    wallet_connected = TRUE,
    auth_method = CASE 
      WHEN auth_method = 'email' THEN 'both'
      ELSE auth_method
    END,
    updated_at = NOW()
  WHERE id = p_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get user by wallet address
CREATE OR REPLACE FUNCTION get_user_by_wallet(p_wallet_address TEXT)
RETURNS TABLE (
  id UUID,
  email TEXT,
  name TEXT,
  full_name TEXT,
  role TEXT,
  wallet_address TEXT,
  wallet_connected BOOLEAN,
  auth_method TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    profiles.id,
    profiles.email,
    profiles.name,
    profiles.full_name,
    profiles.role,
    profiles.wallet_address,
    profiles.wallet_connected,
    profiles.auth_method,
    profiles.created_at
  FROM profiles
  WHERE profiles.wallet_address = p_wallet_address;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_wallet_user TO authenticated, anon;
GRANT EXECUTE ON FUNCTION link_wallet_to_user TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_user_by_wallet TO authenticated, anon;

-- Add comment for documentation
COMMENT ON FUNCTION create_wallet_user IS 'Creates a new user account using only a wallet address';
COMMENT ON FUNCTION link_wallet_to_user IS 'Links a wallet address to an existing user account';
COMMENT ON FUNCTION get_user_by_wallet IS 'Retrieves user information by wallet address';
