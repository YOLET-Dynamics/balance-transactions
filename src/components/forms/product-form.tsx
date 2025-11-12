"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { createItemSchema, ItemTypeEnum } from "@/lib/validation/schemas";

type ProductFormData = z.infer<typeof createItemSchema>;

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => void;
  isLoading?: boolean;
  mode?: "create" | "edit";
}

export function ProductForm({
  initialData,
  onSubmit,
  isLoading = false,
  mode = "create",
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(createItemSchema),
    defaultValues: initialData || {
      type: "Good",
      code: "",
      name: "",
      description: "",
      unit: "pcs",
      sku: "",
      barcode: "",
      defaultPrice: 0,
      vatApplicable: true,
      isActive: true,
    },
  });

  const type = watch("type");
  const vatApplicable = watch("vatApplicable");
  const isActive = watch("isActive");

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Type */}
              <div className="space-y-2">
                <Label className="text-gray-300">Type *</Label>
                <Select value={type} onValueChange={(value) => setValue("type", value as any)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ItemTypeEnum.options.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-red-400 text-sm">{errors.type.message}</p>
                )}
              </div>

              {/* Code */}
              <div className="space-y-2">
                <Label htmlFor="code" className="text-gray-300">
                  Product Code *
                </Label>
                <Input
                  id="code"
                  {...register("code")}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="e.g., PROD-001"
                  disabled={mode === "edit"}
                />
                {errors.code && (
                  <p className="text-red-400 text-sm">{errors.code.message}</p>
                )}
                {mode === "edit" && (
                  <p className="text-gray-500 text-sm">Product code cannot be changed</p>
                )}
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">
                  Product Name *
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="e.g., Premium Coffee Beans"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm">{errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">
                  Description
                </Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Detailed product description..."
                  rows={3}
                />
                {errors.description && (
                  <p className="text-red-400 text-sm">{errors.description.message}</p>
                )}
              </div>

              {/* Unit and Default Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit" className="text-gray-300">
                    Unit *
                  </Label>
                  <Input
                    id="unit"
                    {...register("unit")}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="pcs, kg, liters"
                  />
                  {errors.unit && (
                    <p className="text-red-400 text-sm">{errors.unit.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultPrice" className="text-gray-300">
                    Default Price (ETB) *
                  </Label>
                  <Input
                    id="defaultPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("defaultPrice", { valueAsNumber: true })}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="0.00"
                  />
                  {errors.defaultPrice && (
                    <p className="text-red-400 text-sm">{errors.defaultPrice.message}</p>
                  )}
                </div>
              </div>

              {/* SKU and Barcode */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku" className="text-gray-300">
                    SKU (Stock Keeping Unit)
                  </Label>
                  <Input
                    id="sku"
                    {...register("sku")}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Optional"
                  />
                  {errors.sku && (
                    <p className="text-red-400 text-sm">{errors.sku.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="barcode" className="text-gray-300">
                    Barcode
                  </Label>
                  <Input
                    id="barcode"
                    {...register("barcode")}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="Optional"
                  />
                  {errors.barcode && (
                    <p className="text-red-400 text-sm">{errors.barcode.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Settings */}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vatApplicable"
                  checked={vatApplicable}
                  onCheckedChange={(checked) => setValue("vatApplicable", !!checked)}
                  className="border-white/20"
                />
                <Label htmlFor="vatApplicable" className="text-gray-300 cursor-pointer">
                  VAT Applicable (15%)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={(checked) => setValue("isActive", !!checked)}
                  className="border-white/20"
                />
                <Label htmlFor="isActive" className="text-gray-300 cursor-pointer">
                  Active Product
                </Label>
              </div>

              <p className="text-xs text-gray-500 mt-2">
                Inactive products won't appear in quick-add lists
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card className="bg-gradient-to-br from-brand-yellow-500/10 to-transparent border-brand-yellow-500/20">
            <CardContent className="p-4 space-y-3">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-yellow-500 text-black hover:bg-brand-yellow-600 font-semibold"
              >
                {isLoading
                  ? mode === "create"
                    ? "Creating..."
                    : "Updating..."
                  : mode === "create"
                  ? "Create Product"
                  : "Update Product"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}

