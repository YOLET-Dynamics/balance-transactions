"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductForm } from "@/components/forms/product-form";
import { useCreateItem } from "@/lib/hooks/use-items";

export default function NewProductPage() {
  const router = useRouter();
  const createProduct = useCreateItem();

  const handleSubmit = (data: any) => {
    createProduct.mutate(data, {
      onSuccess: () => {
        router.push("/dashboard/products");
      },
    });
  };

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
          <h1 className="text-3xl font-bold text-white">New Product</h1>
          <p className="text-gray-400 mt-1">
            Add a new product or service to your catalog
          </p>
        </div>
      </div>

      {/* Form */}
      <ProductForm
        onSubmit={handleSubmit}
        isLoading={createProduct.isPending}
        mode="create"
      />
    </div>
  );
}

