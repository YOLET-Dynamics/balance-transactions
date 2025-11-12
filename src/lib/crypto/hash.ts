import { hash, verify, type Options } from "@node-rs/argon2";
import { randomBytes, createHash } from "crypto";

/**
 * Argon2id configuration (OWASP recommended)
 * - memoryCost: 19456 KiB (~19 MB) - OWASP recommendation for interactive logins
 * - timeCost: 2 iterations - balance between security and performance
 * - outputLen: 32 bytes - standard output length
 * - parallelism: 1 thread - suitable for most applications
 * - algorithm: 2 (Argon2id) - hybrid of Argon2i and Argon2d (recommended)
 */
const ARGON2_CONFIG: Options = {
  memoryCost: 19456, // 19 MB
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
  algorithm: 2, // Argon2id
};

/**
 * Hash a password using Argon2id
 * @param password - Plain text password to hash
 * @returns Promise<string> - Argon2 PHC format hash string
 */
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, ARGON2_CONFIG);
}

/**
 * Verify a password against an Argon2 hash
 * Note: The hash contains all parameters, so we don't need to pass options
 * @param password - Plain text password to verify
 * @param hashedPassword - Argon2 hash to verify against
 * @returns Promise<boolean> - True if password matches
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    // The verify function uses parameters from the hash itself
    return await verify(hashedPassword, password);
  } catch (error) {
    // Invalid hash format or verification error
    console.error("Password verification error:", error);
    return false;
  }
}

/**
 * Generate a cryptographically secure random token pair
 * @returns {token: string, hash: string} - Raw token and its SHA-256 hash
 */
export function generateTokenPair(): { token: string; hash: string } {
  const token = randomBytes(32).toString("hex"); // 64 character hex string
  const tokenHash = hashToken(token);
  return { token, hash: tokenHash };
}

/**
 * Hash a token using SHA-256 (for email verification, password reset tokens)
 * @param token - Token to hash
 * @returns string - SHA-256 hash of the token
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Generate a 6-digit OTP (One-Time Password)
 * @returns string - 6-digit numeric OTP
 */
export function generateOTP(): string {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  return otp;
}

/**
 * Hash an OTP using SHA-256 for secure storage
 * @param otp - OTP to hash
 * @returns string - SHA-256 hash of the OTP
 */
export function hashOTP(otp: string): string {
  return createHash("sha256").update(otp).digest("hex");
}
