export interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface CreateOrgData {
  code: string;
  legalName: string;
  tradeName?: string;
  createdBy?: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  isEmailVerified: boolean;
  lastLoginAt?: Date | null;
  createdAt: Date;
}

export interface Organization {
  id: string;
  code: string;
  legalName: string;
  tradeName?: string | null;
  subcity?: string | null;
  cityRegion?: string | null;
  country?: string | null;
  tin?: string | null;
  vatNumber?: string | null;
  phone?: string | null;
  email?: string | null;
}

export interface Session {
  id: string;
  userId: string;
  orgId: string;
  tokenHash: string;
  expiresAt: Date;
}

export interface Membership {
  id: string;
  userId: string;
  orgId: string;
  role: string;
  isActive: boolean;
}

export interface IAuthRepository {
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  createUser(data: CreateUserData): Promise<User>;
  updateUser(id: string, data: Partial<CreateUserData>): Promise<User>;
  updateUserEmailVerified(id: string, verified: boolean): Promise<void>;
  updateUserLastLogin(id: string): Promise<void>;

  findOrgByCode(code: string): Promise<Organization | null>;
  findOrgById(id: string): Promise<Organization | null>;
  createOrg(data: CreateOrgData): Promise<Organization>;

  createMembership(
    userId: string,
    orgId: string,
    role: string
  ): Promise<Membership>;
  findMembershipsByUser(userId: string): Promise<Membership[]>;
  findMembershipByUserAndOrg(
    userId: string,
    orgId: string
  ): Promise<Membership | null>;

  createSession(
    userId: string,
    orgId: string,
    tokenHash: string,
    expiresAt: Date,
    ip?: string,
    userAgent?: string
  ): Promise<Session>;
  findSessionByToken(tokenHash: string): Promise<Session | null>;
  deleteSession(tokenHash: string): Promise<void>;
  deleteExpiredSessions(): Promise<void>;

  createEmailVerificationToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date
  ): Promise<void>;
  findEmailVerificationToken(
    tokenHash: string
  ): Promise<{ userId: string; usedAt: Date | null; expiresAt: Date } | null>;
  markEmailVerificationTokenUsed(tokenHash: string): Promise<void>;

  createPasswordResetToken(
    userId: string,
    tokenHash: string,
    expiresAt: Date
  ): Promise<void>;
  findPasswordResetToken(
    tokenHash: string
  ): Promise<{ userId: string; usedAt: Date | null; expiresAt: Date } | null>;
  markPasswordResetTokenUsed(tokenHash: string): Promise<void>;
}
