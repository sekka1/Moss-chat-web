/**
 * Authentication service
 *
 * Handles password verification and JWT token creation/validation.
 *
 * Password flow:
 *   1. Client SHA-256 hashes the plaintext password (Web Crypto API)
 *   2. Client sends the hex-encoded SHA-256 digest to the server
 *   3. Server stores/verifies argon2(sha256hex)
 *
 * This ensures the raw password never travels over the wire, and the
 * server stores a strong hash (argon2) of the client-side digest.
 *
 * @module auth-service
 */

import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { getDb } from './db.js';

/** JWT payload shape */
export interface TokenPayload {
  userId: number;
  email: string;
}

/** User row from the database */
interface UserRow {
  id: number;
  email: string;
  password_hash: string;
}

/** Duration constants */
const TOKEN_EXPIRY = '30d';

/**
 * Returns the JWT signing secret from the environment.
 * Throws at call-time if not configured.
 * @returns The secret string
 * @throws Error if SESSION_SECRET is not set
 */
function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is required');
  }
  return secret;
}

/**
 * Verifies a user's login credentials and returns a signed JWT.
 *
 * @param email - The user's email address
 * @param clientHash - The SHA-256 hex digest of the user's password (produced client-side)
 * @returns A signed JWT string, or null if credentials are invalid
 */
export async function verifyLogin(
  email: string,
  clientHash: string
): Promise<string | null> {
  const db = getDb();

  const user = db
    .prepare('SELECT id, email, password_hash FROM users WHERE email = ?')
    .get(email) as UserRow | undefined;

  if (!user) {
    // Spend time hashing anyway to prevent timing-based user enumeration
    await argon2.hash('dummy-value');
    return null;
  }

  const valid = await argon2.verify(user.password_hash, clientHash);
  if (!valid) {
    return null;
  }

  const payload: TokenPayload = { userId: user.id, email: user.email };
  const token = jwt.sign(payload, getSecret(), { expiresIn: TOKEN_EXPIRY });
  return token;
}

/**
 * Validates a JWT and returns the decoded payload, or null if invalid/expired.
 *
 * @param token - The JWT string from the cookie
 * @returns The decoded TokenPayload, or null
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, getSecret()) as TokenPayload;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Hashes a client-side SHA-256 digest with argon2 for storage.
 * Used by the seed script and (future) sign-up route.
 *
 * @param clientHash - The SHA-256 hex digest of the plaintext password
 * @returns The argon2 hash string to store in the database
 */
export async function hashPassword(clientHash: string): Promise<string> {
  return argon2.hash(clientHash);
}
