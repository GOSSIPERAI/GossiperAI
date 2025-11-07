// lib/constants.ts

export const USER_ROLES = {
    STUDENT: 'student',
    LECTURER: 'lecturer',
    ADMIN: 'admin'
  } as const;
  
  export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
  
  // Additional role-related constants
  export const ROLE_PERMISSIONS = {
    [USER_ROLES.STUDENT]: [
      'session:join',
      'session:leave', 
      'caption:view',
      'payment:contribute'
    ],
    [USER_ROLES.LECTURER]: [
      'session:create',
      'session:edit',
      'session:end',
      'participant:manage',
      'caption:edit',
      'session:join',
      'session:leave',
      'caption:view',
      'payment:contribute'
    ],
    [USER_ROLES.ADMIN]: [
      'admin:users',
      'admin:sessions',
      'admin:analytics',
      'admin:settings',
      'session:create',
      'session:edit',
      'session:end',
      'participant:manage',
      'caption:edit',
      'session:join',
      'session:leave',
      'caption:view',
      'payment:contribute'
    ]
  } as const;
  
  // Role display names
  export const ROLE_DISPLAY_NAMES = {
    [USER_ROLES.STUDENT]: 'Student',
    [USER_ROLES.LECTURER]: 'Lecturer', 
    [USER_ROLES.ADMIN]: 'Administrator'
  } as const;

  // User field mappings for consistent database access
  export const USER_FIELDS = {
    // Database field names
    FULL_NAME: 'full_name',
    DISPLAY_NAME: 'display_name', 
    USERNAME: 'username',
    EMAIL: 'email',
    ROLE: 'role',
    WALLET_ADDRESS: 'wallet_address',
    WALLET_CONNECTED: 'wallet_connected',
    PREFERRED_LANGUAGE: 'preferred_language',
    
    // Default values
    DEFAULT_NAME: 'Unnamed User',
    DEFAULT_ROLE: USER_ROLES.STUDENT,
    DEFAULT_LANGUAGE: 'en'
  } as const;

  // User metadata field mappings (for Supabase auth metadata)
  export const USER_METADATA_FIELDS = {
    FULL_NAME: 'full_name',
    DISPLAY_NAME: 'display_name',
    USERNAME: 'username', 
    ROLE: 'role',
    WALLET_ADDRESS: 'wallet_address',
    PREFERRED_LANGUAGE: 'preferred_language'
  } as const;