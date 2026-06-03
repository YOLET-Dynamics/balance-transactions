import { createRoute } from "@/lib/api/route-handler";
import { ForbiddenError } from "@/lib/utils/errors";

export const POST = createRoute(
  async () => {
    throw new ForbiddenError("Public signup is currently disabled");
  },
  {
    rateLimit: "auth",
  }
);
