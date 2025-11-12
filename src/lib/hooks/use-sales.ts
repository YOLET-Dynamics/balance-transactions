import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { toast } from "sonner";

export interface Invoice {
  id: string;
  number: string;
  year: number;
  seqValue: number;

  // Buyer information
  buyerType?: string | null;
  buyerLegalName?: string | null;
  buyerTradeName?: string | null;
  buyerSubcity?: string | null;
  buyerCityRegion?: string | null;
  buyerCountry?: string | null;
  buyerTin?: string | null;
  buyerVatNumber?: string | null;
  buyerPhone?: string | null;

  // Financial
  currency: string;
  subtotal: number;
  vatAmount: number;
  total: number;
  totalInWords: string;

  // Invoice details
  goodsOrService: string;
  withheldPct?: number | null;
  withheldAmount?: number | null;
  netPayable: number;

  paymentMethod: string;
  paymentRef?: string | null;

  status: "Draft" | "Pending" | "Paid" | "Overdue" | "Cancelled";

  // Personnel
  createdBy?: string | null;
  reviewedBy?: string | null;
  authorizedBy?: string | null;
  receivedBy?: string | null;

  notes?: string | null;
  pdfAttachmentId?: string | null;

  createdAt: string;
  updatedAt: string;

  // Line items
  lines?: Array<{
    id: string;
    description: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    isVatApplicable: boolean;
  }>;
}

interface InvoicesResponse {
  invoices: Invoice[];
  total: number;
}

interface ListInvoicesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export function useInvoices(params: ListInvoicesParams = {}) {
  const { page = 1, limit = 20, search = "", status = "all" } = params;

  return useQuery({
    queryKey: ["invoices", page, limit, search, status],
    queryFn: () =>
      api.get<InvoicesResponse>(
        `/api/sales?page=${page}&limit=${limit}&search=${search}&status=${status}`,
        { showErrorToast: false }
      ),
    staleTime: 30 * 1000, // 30 seconds
    retry: false,
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ["invoice", id],
    queryFn: () =>
      api.get<Invoice>(`/api/sales/${id}`, { showErrorToast: false }),
    enabled: !!id,
    retry: false,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.post("/api/sales", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Invoice created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create invoice", {
        description: error.message,
      });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.patch(`/api/sales/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["invoice", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Invoice updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update invoice", {
        description: error.message,
      });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/sales/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Invoice deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete invoice", {
        description: error.message,
      });
    },
  });
}
