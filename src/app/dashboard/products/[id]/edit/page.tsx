"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/forms/product-form";
import { useItem, useUpdateItem } from "@/lib/hooks/use-items";

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading, error } = useItem(id);
  const updateProduct = useUpdateItem();

  const product = data as any;

  const handleSubmit = (formData: any) => {
    updateProduct.mutate(
      { id, data: formData },
      {
        onSuccess: () => {
          router.push("/dashboard/products");
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-brand-yellow-500 mx-auto" />
          <p className="text-gray-400">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-red-400">Failed to load product</p>
          <Button
            onClick={() => router.back()}
            className="bg-brand-yellow-500 text-black hover:bg-brand-yellow-600"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">Edit Product</h1>
          <p className="text-gray-400 mt-1">Update product information</p>
        </div>
      </div>

      {/* Form */}
      <ProductForm
        initialData={product}
        onSubmit={handleSubmit}
        isLoading={updateProduct.isPending}
        mode="edit"
      />
    </div>
  );
}

