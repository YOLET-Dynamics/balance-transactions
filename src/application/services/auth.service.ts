import type { IAuthRepository } from "../../domain/repositories/auth.repository";
import {
  hashPassword,
  verifyPassword,
  generateTokenPair,
  generateOTP,
  hashOTP,
} from "../../lib/crypto/hash";
import {
  sendVerificationOtp,
  sendPasswordResetEmail,
} from "../../infrastructure/email/resend.client";
import {
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from "../../lib/utils/errors";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const VERIFICATION_OTP_DURATION_MS = 10 * 60 * 1000; // 10 minutes
const RESET_TOKEN_DURATION_MS = 60 * 60 * 1000; // 1 hour

export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  orgCode: string;
  orgLegalName: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResult {
  user: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    isEmailVerified: boolean;
  };
  session: {
    token: string;
    expiresAt: Date;
  };
  organization: {
    id: string;
    code: string;
    legalName: string;
  };
  membership: {
    role: string;
  };
}

export class AuthService {
  constructor(private authRepo: IAuthRepository) {}

  async register(
    input: RegisterInput
  ): Promise<{ userId: string; message: string }> {
    // Check if user already exists
    const existingUser = await this.authRepo.findUserByEmail(input.email);
    if (existingUser) {
      throw new ConflictError("Email already registered");
    }

    // Check if organization code already exists
    const existingOrg = await this.authRepo.findOrgByCode(input.orgCode);
    if (existingOrg) {
      throw new ConflictError("Organization code already taken");
    }

    // Hash password
    const passwordHash = await hashPassword(input.password);

    // Create user
    const user = await this.authRepo.createUser({
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
    });

    // Create organization
    const org = await this.authRepo.createOrg({
      code: input.orgCode,
      legalName: input.orgLegalName,
      createdBy: user.id,
    });

    // Create membership with Owner role
    await this.authRepo.createMembership(user.id, org.id, "Owner");

    // Generate OTP for email verification
    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const expiresAt = new Date(Date.now() + VERIFICATION_OTP_DURATION_MS);
    await this.authRepo.createEmailVerificationToken(
      user.id,
      otpHash,
      expiresAt
    );

    // Send verification OTP (async, don't block registration)
    sendVerificationOtp(user.email, otp).catch((err) => {
      console.error("Failed to send verification OTP:", err);
    });

    return {
      userId: user.id,
      message:
        "Registration successful. Please check your email for the verification code.",
    };
  }

  async login(
    input: LoginInput,
    ip?: string,
    userAgent?: string
  ): Promise<AuthResult> {
    // Find user
    const user = await this.authRepo.findUserByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Verify password
    const isValid = await verifyPassword(input.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError("Invalid email or password");
    }

    // Get user's memberships (pick the first active one)
    const memberships = await this.authRepo.findMembershipsByUser(user.id);
    if (memberships.length === 0) {
      throw new UnauthorizedError("No organization membership found");
    }

    const membership = memberships[0]; // Default to first membership
    const org = await this.authRepo.findOrgById(membership.orgId);
    if (!org) {
      throw new NotFoundError("Organization not found");
    }

    // Generate session token
    const { token, hash } = generateTokenPair();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    await this.authRepo.createSession(
      user.id,
      org.id,
      hash,
      expiresAt,
      ip,
      userAgent
    );

    // Update last login
    await this.authRepo.updateUserLastLogin(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
      },
      session: {
        token,
        expiresAt,
      },
      organization: {
        id: org.id,
        code: org.code,
        legalName: org.legalName,
      },
      membership: {
        role: membership.role,
      },
    };
  }

  async logout(token: string): Promise<void> {
    await this.authRepo.deleteSession(token);
  }

  async verifyEmail(email: string, otp: string): Promise<void> {
    // Find user by email
    const user = await this.authRepo.findUserByEmail(email);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.isEmailVerified) {
      throw new ConflictError("Email already verified");
    }

    // Hash the provided OTP
    const otpHash = hashOTP(otp);

    // Find the verification token by hash
    const tokenRecord = await this.authRepo.findEmailVerificationToken(otpHash);

    if (!tokenRecord) {
      throw new UnauthorizedError("Invalid or expired verification code");
    }

    if (tokenRecord.userId !== user.id) {
      throw new UnauthorizedError("Invalid verification code");
    }

    if (tokenRecord.usedAt) {
      throw new ConflictError("Verification code already used");
    }

    // Check if expired
    if (tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedError("Verification code has expired");
    }

    await this.authRepo.updateUserEmailVerified(tokenRecord.userId, true);
    await this.authRepo.markEmailVerificationTokenUsed(otpHash);
  }

  async resendVerificationOtp(email: string): Promise<{ message: string }> {
    // Find user by email
    const user = await this.authRepo.findUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not
      return {
        message:
          "If an account exists with that email, a new code has been sent.",
      };
    }

    if (user.isEmailVerified) {
      throw new ConflictError("Email already verified");
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpHash = hashOTP(otp);
    const expiresAt = new Date(Date.now() + VERIFICATION_OTP_DURATION_MS);

    await this.authRepo.createEmailVerificationToken(
      user.id,
      otpHash,
      expiresAt
    );

    sendVerificationOtp(user.email, otp).catch((err) => {
      throw err;
    });

    return {
      message: "A new verification code has been sent to your email.",
    };
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await this.authRepo.findUserByEmail(email);

    if (!user) {
      return {
        message:
          "If an account exists with that email, a password reset link has been sent.",
      };
    }

    const { token, hash } = generateTokenPair();
    const expiresAt = new Date(Date.now() + RESET_TOKEN_DURATION_MS);
    await this.authRepo.createPasswordResetToken(user.id, hash, expiresAt);

    sendPasswordResetEmail(user.email, token).catch((err) => {
      throw err;
    });

    return {
      message:
        "If an account exists with that email, a password reset link has been sent.",
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenRecord = await this.authRepo.findPasswordResetToken(token);

    if (!tokenRecord) {
      throw new NotFoundError("Invalid or expired reset token");
    }

    if (tokenRecord.usedAt) {
      throw new ConflictError("Token already used");
    }

    // Check if expired
    if (tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedError("Reset token has expired");
    }

    const passwordHash = await hashPassword(newPassword);
    await this.authRepo.updateUser(tokenRecord.userId, { passwordHash });
    await this.authRepo.markPasswordResetTokenUsed(token);
  }

  async validateSession(tokenHash: string): Promise<{
    userId: string;
    orgId: string;
    role: string;
  } | null> {
    const session = await this.authRepo.findSessionByToken(tokenHash);

    if (!session) {
      return null;
    }

    if (session.expiresAt < new Date()) {
      await this.authRepo.deleteSession(tokenHash);
      return null;
    }

    const membership = await this.authRepo.findMembershipByUserAndOrg(
      session.userId,
      session.orgId
    );
    if (!membership || !membership.isActive) {
      return null;
    }

    return {
      userId: session.userId,
      orgId: session.orgId,
      role: membership.role,
    };
  }
}

// Export singleton service
import { authRepository } from "../../infrastructure/repositories/auth.repository.impl";
export const authService = new AuthService(authRepository);
