import { createRoute } from "@/lib/api/route-handler";
import { authRepository } from "@/infrastructure/repositories/auth.repository.impl";

export const GET = createRoute(
  async ({ auth }) => {
    const user = await authRepository.findUserById(auth!.userId);
    const organization = await authRepository.findOrgById(auth!.orgId);
    const membership = await authRepository.findMembershipByUserAndOrg(
      auth!.userId,
      auth!.orgId
    );

    if (!user || !organization || !membership) {
      throw new Error("Session data not found");
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
      },
      organization: {
        id: organization.id,
        code: organization.code,
        legalName: organization.legalName,
        tradeName: organization.tradeName,
        subcity: organization.subcity,
        cityRegion: organization.cityRegion,
        country: organization.country,
        tin: organization.tin,
        vatNumber: organization.vatNumber,
        phone: organization.phone,
        email: organization.email,
      },
      membership: {
        id: membership.id,
        role: membership.role,
      },
    };
  },
  {
    requireAuth: true,
    rateLimit: "queries",
  }
);

