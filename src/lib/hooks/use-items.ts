import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { toast } from "sonner";

export interface Item {
  id: string;
  orgId: string;
  type: "Good" | "Service";
  code: string;
  name: string;
  description: string | null;
  unit: string;
  sku: string | null;
  barcode: string | null;
  defaultPrice: number;
  vatApplicable: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemInput {
  type: "Good" | "Service";
  code: string;
  name: string;
  description?: string;
  unit: string;
  sku?: string;
  barcode?: string;
  defaultPrice: number;
  vatApplicable?: boolean;
  isActive?: boolean;
}

export interface ItemsListOptions {
  page?: number;
  limit?: number;
  search?: string;
  type?: "Good" | "Service";
  isActive?: boolean;
}

export function useItems(options: ItemsListOptions = {}) {
  const { page = 1, limit = 50, search, type, isActive = true } = options;

  return useQuery<{ items: Item[]; total: number }>({
    queryKey: ["items", page, limit, search, type, isActive],
    queryFn: () =>
      api.get("/api/items", {
        params: { page, limit, search, type, isActive },
      }),
    staleTime: 60 * 1000, // Cache for 1 minute
    retry: false,
  });
}

export function useItem(id: string) {
  return useQuery<Item>({
    queryKey: ["item", id],
    queryFn: () => api.get(`/api/items/${id}`),
    enabled: !!id,
    retry: false,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateItemInput) => api.post("/api/items", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success("Product created successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create product");
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateItemInput> }) =>
      api.patch(`/api/items/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["item", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success("Product updated successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update product");
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] });
      toast.success("Product deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete product");
    },
  });
}

