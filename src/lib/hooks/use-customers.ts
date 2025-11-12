import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { toast } from "sonner";

export interface Customer {
  id: string;
  orgId: string;
  type: "Company" | "Individual";
  legalName?: string | null;
  tradeName?: string | null;
  subcity?: string | null;
  cityRegion?: string | null;
  country: string;
  tin?: string | null;
  vatNumber?: string | null;
  phone?: string | null;
  email?: string | null;
  contactPerson?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CustomersResponse {
  customers: Customer[];
}

export function useCustomers(search: string = "") {
  return useQuery({
    queryKey: ["customers", search],
    queryFn: () =>
      api.get<CustomersResponse>(`/api/customers?search=${encodeURIComponent(search)}`),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Customer>) => api.post("/api/customers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      toast.success("Customer saved successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to save customer", {
        description: error.message,
      });
    },
  });
}

