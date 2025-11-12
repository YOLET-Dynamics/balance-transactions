import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { toast } from "sonner";

export interface Vendor {
  id: string;
  orgId: string;
  type: "Individual" | "Company";
  legalName: string | null;
  tradeName: string | null;
  subcity: string | null;
  cityRegion: string | null;
  country: string;
  tin: string | null;
  vatNumber: string | null;
  phone: string | null;
  email: string | null;
  contactPerson: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVendorInput {
  type: "Individual" | "Company";
  legalName?: string;
  tradeName?: string;
  subcity?: string;
  cityRegion?: string;
  country?: string;
  tin?: string;
  vatNumber?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  notes?: string;
}

export function useVendors(search?: string) {
  return useQuery<{ vendors: Vendor[] }>({
    queryKey: ["vendors", search],
    queryFn: () =>
      api.get("/api/vendors", {
        params: { search },
      }),
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVendorInput) => api.post("/api/vendors", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
      toast.success("Vendor saved successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to save vendor");
    },
  });
}

