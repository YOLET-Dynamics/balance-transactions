import { prisma } from "../database/prisma";
import type {
  IAuthRepository,
  CreateUserData,
  CreateOrgData,
  User,
  Organization,
  Session,
  Membership,
} from "../../domain/repositories/auth.repository";

export class AuthRepository implements IAuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { email } });
  }

  async findUserById(id: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { id } });
  }

  async createUser(data: CreateUserData): Promise<User> {
    return await prisma.user.create({ data });
  }

  async updateUser(id: string, data: Partial<CreateUserData>): Promise<User> {
    return await prisma.user.update({ where: { id }, data });
  }

  async updateUserEmailVerified(id: string, verified: boolean): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { isEmailVerified: verified },
    });
  }

  async updateUserLastLogin(id: string): Promise<void> {
    await prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async findOrgByCode(code: string): Promise<Organization | null> {
    return await prisma.organization.findUnique({ where: { code } });
  }

  async findOrgById(id: string): Promise<Organization | null> {
    return await prisma.organization.findUnique({ where: { id } });
  }

  async createOrg(data: CreateOrgData): Promise<Organization> {
    return await prisma.organization.create({ data });
  }

  async createMembership(
    userId: string,
    orgId: string,
    role: string
  ): Promise<Membership> {
    return await prisma.membership.create({
      data: {
        userId,
        orgId,
        role: role as any,
        acceptedAt: new Date(),
      },
    });
  }

  async findMembershipsByUser(userId: string): Promise<Membership[]> {
    return await prisma.membership.findMany({
      where: { userId, isActive: true },
    });
  }

  async findMembershipByUserAndOrg(
    userId: string,
    orgId: string
  ): Promise<Membership | null> {
    return await prisma.membership.findUnique({
      where: { userId_orgId: { userId, orgId } },
    });
  }

  async createSession(
    userId: string,
    orgId: string,
    tokenHash: string,
    expiresAt: Date,
    ip?: string,
    userAgent?: string
  ): Promise<Session> {
    return await prisma.session.create({
      data: {
        userId,
        orgId,
        tokenHash,
        expiresAt,
        ip,
        userAgent,
      },
    });
  }

  async findSessionByToken(tokenHash: string): Promise<Session | null> {
    return await prisma.session.findUnique({
      where: { tokenHash },
    });
  }

  async deleteSession(tokenHash: string): Promise<void> {
    await prisma.session.delete({ where: { tokenHash } }).catch(() => {});
  }

  async deleteExpiredSessions(): Promise<void> {
    await prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
  }

  async createEmailVerificationToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date
  ): Promise<void> {
    await prisma.emailVerificationToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  }

  async findEmailVerificationToken(
    tokenHash: string
  ): Promise<{ userId: string; usedAt: Date | null; expiresAt: Date } | null> {
    return await prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
      select: { userId: true, usedAt: true, expiresAt: true },
    });
  }

  async markEmailVerificationTokenUsed(tokenHash: string): Promise<void> {
    await prisma.emailVerificationToken.update({
      where: { tokenHash },
      data: { usedAt: new Date() },
    });
  }

  async createPasswordResetToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date
  ): Promise<void> {
    await prisma.passwordResetToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  }

  async findPasswordResetToken(
    tokenHash: string
  ): Promise<{ userId: string; usedAt: Date | null; expiresAt: Date } | null> {
    return await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      select: { userId: true, usedAt: true, expiresAt: true },
    });
  }

  async markPasswordResetTokenUsed(tokenHash: string): Promise<void> {
    await prisma.passwordResetToken.update({
      where: { tokenHash },
      data: { usedAt: new Date() },
    });
  }
}

// Export singleton instance
export const authRepository = new AuthRepository();
