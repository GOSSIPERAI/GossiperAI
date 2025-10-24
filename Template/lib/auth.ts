import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from './db';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const TOKEN_EXPIRY = '7d'; // 7 days

export interface User {
  id: string;
  username: string;
  email: string;
  display_name: string | null;
  wallet_address: string | null;
  wallet_connected_at: Date | null;
  created_at: Date;
  email_verified: boolean;
  last_login: Date | null;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  username: string;
}

// Password hashing
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT token generation and verification
export function generateToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

export function verifyToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch (error) {
    return null;
  }
}

// User operations
export async function createUser(
  username: string,
  email: string,
  password: string,
  displayName?: string
): Promise<User> {
  const passwordHash = await hashPassword(password);
  
  const result = await query(
    `INSERT INTO users (username, email, password_hash, display_name)
     VALUES ($1, $2, $3, $4)
     RETURNING id, username, email, display_name, wallet_address, wallet_connected_at, 
               created_at, email_verified, last_login`,
    [username, email, passwordHash, displayName || username]
  );
  
  return result.rows[0];
}

export async function findUserByEmail(email: string): Promise<(User & { password_hash: string }) | null> {
  const result = await query(
    `SELECT id, username, email, password_hash, display_name, wallet_address, 
            wallet_connected_at, created_at, email_verified, last_login
     FROM users
     WHERE email = $1`,
    [email]
  );
  
  return result.rows[0] || null;
}

export async function findUserByUsername(username: string): Promise<User | null> {
  const result = await query(
    `SELECT id, username, email, display_name, wallet_address, wallet_connected_at,
            created_at, email_verified, last_login
     FROM users
     WHERE username = $1`,
    [username]
  );
  
  return result.rows[0] || null;
}

export async function findUserById(userId: string): Promise<User | null> {
  const result = await query(
    `SELECT id, username, email, display_name, wallet_address, wallet_connected_at,
            created_at, email_verified, last_login
     FROM users
     WHERE id = $1`,
    [userId]
  );
  
  return result.rows[0] || null;
}

export async function updateUserLastLogin(userId: string): Promise<void> {
  await query(
    `UPDATE users SET last_login = NOW() WHERE id = $1`,
    [userId]
  );
}

export async function connectWalletToUser(userId: string, walletAddress: string): Promise<User> {
  // Check if wallet is already connected to another user
  const existingWallet = await query(
    `SELECT id, username FROM users WHERE wallet_address = $1 AND id != $2`,
    [walletAddress, userId]
  );
  
  if (existingWallet.rows.length > 0) {
    throw new Error('This wallet is already connected to another account');
  }
  
  const result = await query(
    `UPDATE users 
     SET wallet_address = $1, wallet_connected_at = NOW(), updated_at = NOW()
     WHERE id = $2
     RETURNING id, username, email, display_name, wallet_address, wallet_connected_at,
               created_at, email_verified, last_login`,
    [walletAddress, userId]
  );
  
  return result.rows[0];
}

export async function disconnectWalletFromUser(userId: string): Promise<User> {
  const result = await query(
    `UPDATE users 
     SET wallet_address = NULL, wallet_connected_at = NULL, updated_at = NOW()
     WHERE id = $1
     RETURNING id, username, email, display_name, wallet_address, wallet_connected_at,
               created_at, email_verified, last_login`,
    [userId]
  );
  
  return result.rows[0];
}

// Session management
export async function setAuthCookie(user: User): Promise<string> {
  const token = generateToken({
    userId: user.id,
    email: user.email,
    username: user.username,
  });
  
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
  
  return token;
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return null;
    }
    
    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }
    
    return findUserById(payload.userId);
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Validation helpers
export function validateEmail(email: string): boolean {
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email);
}

export function validateUsername(username: string): boolean {
  const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
  return usernameRegex.test(username);
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }
  if (password.length > 128) {
    return { valid: false, error: 'Password must be less than 128 characters' };
  }
  // At least one letter and one number
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one letter and one number' };
  }
  return { valid: true };
}

