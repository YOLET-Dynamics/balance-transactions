import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { toast } from "sonner";

export interface ProformaInvoice {
  id: string;
  number: string;
  year: number;
  seqValue: number;
  kind: "Proforma";

  buyerType?: string | null;
  buyerLegalName?: string | null;
  buyerTradeName?: string | null;
  buyerSubcity?: string | null;
  buyerCityRegion?: string | null;
  buyerCountry?: string | null;
  buyerTin?: string | null;
  buyerVatNumber?: string | null;
  buyerPhone?: string | null;

  currency: string;
  subtotal: number;
  vatAmount: number;
  total: number;
  totalInWords: string;

  goodsOrService: string;
  withheldPct?: number | null;
  withheldAmount?: number | null;
  netPayable: number;

  paymentMethod: string;
  paymentRef?: string | null;

  invoiceType: "Cash" | "Credit";
  invoiceDate: string;
  dueDate: string;

  status: "Draft" | "Pending" | "Cancelled";

  createdBy?: string | null;
  reviewedBy?: string | null;
  authorizedBy?: string | null;
  receivedBy?: string | null;

  notes?: string | null;
  pdfAttachmentId?: string | null;

  createdAt: string;
  updatedAt: string;

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

interface ProformasResponse {
  invoices: ProformaInvoice[];
  total: number;
}

interface ListProformasParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export function useProformaInvoices(params: ListProformasParams = {}) {
  const { page = 1, limit = 20, search = "", status = "all" } = params;

  return useQuery({
    queryKey: ["proforma-invoices", page, limit, search, status],
    queryFn: () =>
      api.get<ProformasResponse>(
        `/api/proforma-invoices?page=${page}&limit=${limit}&search=${search}&status=${status}`,
        { showErrorToast: false }
      ),
    staleTime: 30 * 1000,
    retry: false,
  });
}

export function useProformaInvoice(id: string) {
  return useQuery({
    queryKey: ["proforma-invoice", id],
    queryFn: () =>
      api.get<ProformaInvoice>(`/api/proforma-invoices/${id}`, { showErrorToast: false }),
    enabled: !!id,
    retry: false,
  });
}

export function useCreateProforma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => api.post("/api/proforma-invoices", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proforma-invoices"] });
      toast.success("Proforma invoice created successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to create proforma invoice", {
        description: error.message,
      });
    },
  });
}

export function useUpdateProforma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.patch(`/api/proforma-invoices/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["proforma-invoice", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["proforma-invoices"] });
      toast.success("Proforma invoice updated successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to update proforma invoice", {
        description: error.message,
      });
    },
  });
}

export function useDeleteProforma() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/proforma-invoices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proforma-invoices"] });
      toast.success("Proforma invoice deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Failed to delete proforma invoice", {
        description: error.message,
      });
    },
  });
}

