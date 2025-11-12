import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { toast } from "sonner";

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UpdateOrganizationInput {
  legalName?: string;
  tradeName?: string;
  subcity?: string;
  cityRegion?: string;
  country?: string;
  tin?: string;
  vatNumber?: string;
  phone?: string;
  email?: string;
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileInput) => api.patch("/api/profile", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      toast.success("Profile updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateOrganizationInput) =>
      api.patch("/api/organization", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      toast.success("Organization updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update organization");
    },
  });
}

