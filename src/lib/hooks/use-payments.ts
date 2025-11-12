import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { toast } from "sonner";

export interface Payment {
  id: string;
  orgId: string;
  direction: "Incoming" | "Outgoing";
  method: string;
  amount: number;
  currency: string;
  relatedType: "Invoice" | "Bill" | "None";
  relatedId: string | null;
  voucherPdfId: string | null;
  createdBy: string | null;
  reviewedBy: string | null;
  authorizedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentInput {
  direction: "Incoming" | "Outgoing";
  method: string;
  amount: number;
  relatedType: "Invoice" | "Bill" | "None";
  relatedId?: string;
  createdBy?: string;
  reviewedBy?: string;
  authorizedBy?: string;
}

export interface PaymentsListOptions {
  page?: number;
  limit?: number;
  search?: string;
  direction?: "Incoming" | "Outgoing";
  year?: number;
}

export function usePayments(options: PaymentsListOptions = {}) {
  const { page = 1, limit = 20, search, direction, year } = options;

  return useQuery<{ payments: Payment[]; total: number }>({
    queryKey: ["payments", page, limit, search, direction, year],
    queryFn: () =>
      api.get("/api/payments", {
        params: { page, limit, search, direction, year },
      }),
    staleTime: 30 * 1000,
    showErrorToast: false,
    retry: false,
  });
}

export function usePayment(id: string) {
  return useQuery<Payment>({
    queryKey: ["payment", id],
    queryFn: () => api.get(`/api/payments/${id}`),
    enabled: !!id,
    showErrorToast: false,
    retry: false,
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePaymentInput) => api.post("/api/payments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Payment created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create payment");
    },
  });
}

export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePaymentInput> }) =>
      api.patch(`/api/payments/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["payment", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Payment updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update payment");
    },
  });
}

export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/payments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Payment deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete payment");
    },
  });
}

