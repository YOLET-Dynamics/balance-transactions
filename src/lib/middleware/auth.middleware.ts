import { NextRequest } from "next/server";
import { authService } from "../../application/services/auth.service";
import { UnauthorizedError, ForbiddenError } from "../utils/errors";
import { hashToken } from "../crypto/hash";

export interface AuthContext {
  userId: string;
  orgId: string;
  role: string;
}

const COOKIE_NAME = "session_token";

export async function authenticateRequest(
  request: NextRequest
): Promise<AuthContext> {
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    throw new UnauthorizedError("Not authenticated");
  }

  const tokenHash = hashToken(token);

  const session = await authService.validateSession(tokenHash);

  if (!session) {
    throw new UnauthorizedError("Invalid or expired session");
  }

  return {
    userId: session.userId,
    orgId: session.orgId,
    role: session.role,
  };
}

const ROLE_HIERARCHY: Record<string, number> = {
  Viewer: 1,
  Staff: 2,
  Manager: 3,
  Admin: 4,
  Owner: 5,
};

export function hasRole(userRole: string, requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  return userLevel >= requiredLevel;
}

export function requireRole(context: AuthContext, minRole: string): void {
  if (!hasRole(context.role, minRole)) {
    throw new ForbiddenError(`Requires ${minRole} role or higher`);
  }
}

export function requireAnyRole(context: AuthContext, roles: string[]): void {
  if (!roles.some((role) => hasRole(context.role, role))) {
    throw new ForbiddenError(`Requires one of: ${roles.join(", ")}`);
  }
}

export function getSessionCookieOptions(token: string, expiresAt: Date) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    expires: expiresAt,
    path: "/",
  };
}

export function clearSessionCookie() {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    expires: new Date(0),
    path: "/",
  };
}
