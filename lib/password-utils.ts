/**
 * Password hashing utilities using bcryptjs
 * Compatible with Node.js runtime only
 */

import bcryptjs from 'bcryptjs';

/**
 * Hash a password using bcrypt
 * @param password - Plain text password
 * @param rounds - Salt rounds (default: 10)
 * @returns Hashed password
 */
export async function hashPassword(password: string, rounds: number = 10): Promise<string> {
  try {
    return await bcryptjs.hash(password, rounds);
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Failed to hash password');
  }
}

/**
 * Compare a plain text password with a hashed password
 * @param password - Plain text password
 * @param hashedPassword - Bcrypt hashed password
 * @returns True if passwords match
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcryptjs.compare(password, hashedPassword);
  } catch (error) {
    console.error('Error comparing password:', error);
    throw new Error('Failed to compare password');
  }
}
