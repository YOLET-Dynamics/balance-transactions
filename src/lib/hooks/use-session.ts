import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";

interface Organization {
  id: string;
  code: string;
  legalName: string;
  tradeName?: string | null;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

interface Membership {
  id: string;
  role: string;
}

export interface SessionData {
  user: User;
  organization: Organization;
  membership: Membership;
}

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: () => api.get<SessionData>("/api/auth/session", { showErrorToast: false }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}
