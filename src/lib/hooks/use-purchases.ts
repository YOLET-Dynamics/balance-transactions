import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { toast } from "sonner";

export interface BillLine {
  id?: string;
  itemId?: string | null;
  description: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  discountAmount?: number;
  lineTotal: number;
  isVatApplicable: boolean;
}

export interface PurchaseBill {
  id: string;
  orgId: string;
  number: string;
  year: number;
  seqValue: number;

  vendorLegalName: string | null;
  vendorTradeName: string | null;
  vendorSubcity: string | null;
  vendorCityRegion: string | null;
  vendorCountry: string | null;
  vendorTin: string | null;
  vendorVatNumber: string | null;
  vendorPhone: string | null;

  currency: string;
  subtotal: number;
  vatAmount: number;
  total: number;

  withheldPct: number | null;
  withheldAmount: number | null;
  netPaid: number;

  reason: string;
  paymentMethod: string;
  paymentRef: string | null;

  status: string;

  createdBy: string | null;
  reviewedBy: string | null;
  authorizedBy: string | null;

  pdfAttachmentId: string | null;

  lines?: BillLine[];

  createdAt: string;
  updatedAt: string;
}

interface ListBillsParams {
  page?: number;
  limit?: number;
  search?: string;
  year?: number;
}

interface BillsResponse {
  bills: PurchaseBill[];
  total: number;
}

export function usePurchaseBills(params: ListBillsParams = {}) {
  const { page = 1, limit = 20, search = "", year } = params;

  return useQuery({
    queryKey: ["purchase-bills", page, limit, search, year],
    queryFn: () => {
      let url = `/api/purchases?page=${page}&limit=${limit}&search=${search}`;
      if (year) url += `&year=${year}`;
      return api.get<BillsResponse>(url, { showErrorToast: false });
    },
    staleTime: 30 * 1000, // 30 seconds
    retry: false,
  });
}

export function usePurchaseBill(id: string) {
  return useQuery({
    queryKey: ["purchase-bill", id],
    queryFn: () =>
      api.get<PurchaseBill>(`/api/purchases/${id}`, { showErrorToast: false }),
    enabled: !!id,
    retry: false,
  });
}

export function useCreatePurchaseBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.post("/api/purchases", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-bills"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Purchase bill created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create purchase bill", {
        description: error.message,
      });
    },
  });
}

export function useUpdatePurchaseBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.patch(`/api/purchases/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["purchase-bill", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["purchase-bills"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Purchase bill updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update purchase bill", {
        description: error.message,
      });
    },
  });
}

export function useDeletePurchaseBill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/purchases/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-bills"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Purchase bill deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete purchase bill", {
        description: error.message,
      });
    },
  });
}
