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

  async createRegistration(
    userData: CreateUserData,
    orgData: CreateOrgData,
    verificationTokenHash: string,
    verificationTokenExpiresAt: Date
  ): Promise<{ user: User; organization: Organization }> {
    return await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({ data: userData });
      const organization = await tx.organization.create({
        data: {
          ...orgData,
          createdBy: user.id,
        },
      });

      await tx.membership.create({
        data: {
          userId: user.id,
          orgId: organization.id,
          role: "Owner",
          acceptedAt: new Date(),
        },
      });

      await tx.emailVerificationToken.create({
        data: {
          userId: user.id,
          tokenHash: verificationTokenHash,
          expiresAt: verificationTokenExpiresAt,
        },
      });

      return { user, organization };
    });
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
    return await prisma.organization.findUnique({
      where: { id },
      include: { logoAttachment: true },
    });
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
        role: role as "Owner" | "Admin" | "Manager" | "Staff" | "Viewer",
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
    await prisma.$transaction(async (tx) => {
      await tx.emailVerificationToken.updateMany({
        where: { userId, usedAt: null },
        data: { usedAt: new Date() },
      });

      await tx.emailVerificationToken.create({
        data: { userId, tokenHash, expiresAt },
      });
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

  async consumeEmailVerificationToken(
    userId: string,
    tokenHash: string,
    now: Date
  ): Promise<boolean> {
    return await prisma.$transaction(async (tx) => {
      const result = await tx.emailVerificationToken.updateMany({
        where: {
          userId,
          tokenHash,
          usedAt: null,
          expiresAt: { gt: now },
        },
        data: { usedAt: now },
      });

      if (result.count === 0) {
        return false;
      }

      await tx.user.update({
        where: { id: userId },
        data: { isEmailVerified: true },
      });

      return true;
    });
  }

  async createPasswordResetToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.passwordResetToken.updateMany({
        where: { userId, usedAt: null },
        data: { usedAt: new Date() },
      });

      await tx.passwordResetToken.create({
        data: { userId, tokenHash, expiresAt },
      });
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

  async consumePasswordResetToken(
    tokenHash: string,
    passwordHash: string,
    now: Date
  ): Promise<boolean> {
    return await prisma.$transaction(async (tx) => {
      const token = await tx.passwordResetToken.findUnique({
        where: { tokenHash },
        select: { id: true, userId: true },
      });

      if (!token) {
        return false;
      }

      const result = await tx.passwordResetToken.updateMany({
        where: {
          id: token.id,
          usedAt: null,
          expiresAt: { gt: now },
        },
        data: { usedAt: now },
      });

      if (result.count === 0) {
        return false;
      }

      await tx.user.update({
        where: { id: token.userId },
        data: { passwordHash },
      });

      await tx.session.deleteMany({
        where: { userId: token.userId },
      });

      return true;
    });
  }
}

// Export singleton instance
export const authRepository = new AuthRepository();
