"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Calculator, User, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createPurchaseBillSchema,
  PaymentMethodEnum,
  PartyTypeEnum,
} from "@/lib/validation/schemas";
import { useSession } from "@/lib/hooks/use-session";
import { useVendors, useCreateVendor } from "@/lib/hooks/use-vendors";

type PurchaseBillFormData = z.infer<typeof createPurchaseBillSchema>;

interface PurchaseBillFormProps {
  initialData?: Partial<PurchaseBillFormData>;
  onSubmit: (data: PurchaseBillFormData) => void;
  isLoading?: boolean;
  mode?: "create" | "edit";
}

// Quick-add templates for common recurring purchases
const PURCHASE_TEMPLATES = [
  {
    id: "rent",
    label: "Rent",
    icon: "🏢",
    description: "Monthly rent for ",
    unit: "month",
    quantity: 1,
    defaultPrice: 0,
  },
  {
    id: "telephone",
    label: "Telephone",
    icon: "📞",
    description: "Telephone bill for ",
    unit: "month",
    quantity: 1,
    defaultPrice: 0,
  },
  {
    id: "internet",
    label: "Internet",
    icon: "🌐",
    description: "Internet service for ",
    unit: "month",
    quantity: 1,
    defaultPrice: 0,
  },
  {
    id: "electricity",
    label: "Electricity",
    icon: "⚡",
    description: "Electricity bill for ",
    unit: "month",
    quantity: 1,
    defaultPrice: 0,
  },
  {
    id: "water",
    label: "Water",
    icon: "💧",
    description: "Water bill for ",
    unit: "month",
    quantity: 1,
    defaultPrice: 0,
  },
  {
    id: "stationery",
    label: "Stationery",
    icon: "📝",
    description: "Office stationery and supplies",
    unit: "lot",
    quantity: 1,
    defaultPrice: 0,
  },
  {
    id: "fuel",
    label: "Fuel",
    icon: "⛽",
    description: "Fuel expenses for ",
    unit: "liters",
    quantity: 1,
    defaultPrice: 0,
  },
  {
    id: "maintenance",
    label: "Maintenance",
    icon: "🔧",
    description: "Maintenance and repairs for ",
    unit: "service",
    quantity: 1,
    defaultPrice: 0,
  },
];

export function PurchaseBillForm({
  initialData,
  onSubmit,
  isLoading = false,
  mode = "create",
}: PurchaseBillFormProps) {
  const [vatRate] = useState(0.15); // 15% VAT
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");
  const [vendorSearch, setVendorSearch] = useState("");
  const [saveVendor, setSaveVendor] = useState(false);
  const [applyWithholding, setApplyWithholding] = useState(false);

  const { data: session } = useSession();
  const { data: vendorsData } = useVendors(vendorSearch);
  const createVendor = useCreateVendor();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PurchaseBillFormData>({
    resolver: zodResolver(createPurchaseBillSchema),
    defaultValues: initialData || {
      lines: [
        {
          lineType: "Good",
          description: "",
          unit: "pcs",
          quantity: 1,
          unitPrice: 0,
          discountAmount: 0,
          isVatApplicable: true,
        },
      ],
      paymentMethod: "Cash",
      vendorCountry: "ET",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const lines = watch("lines");

  // Handle quick-add template selection
  const handleQuickAdd = (template: (typeof PURCHASE_TEMPLATES)[0]) => {
    append({
      lineType:
        template.id === "rent" ||
        template.id === "telephone" ||
        template.id === "internet" ||
        template.id === "electricity" ||
        template.id === "water" ||
        template.id === "maintenance"
          ? "Service"
          : "Good",
      description: template.description,
      unit: template.unit,
      quantity: template.quantity,
      unitPrice: template.defaultPrice,
      discountAmount: 0,
      isVatApplicable: true,
    });

    // Scroll to the newly added item
    setTimeout(() => {
      const lineItems = document.querySelectorAll("[data-line-item]");
      const lastItem = lineItems[lineItems.length - 1];
      if (lastItem) {
        lastItem.scrollIntoView({ behavior: "smooth", block: "center" });
        // Focus on the description field to continue typing
        const descInput = lastItem.querySelector(
          'input[placeholder="Item description"]'
        ) as HTMLInputElement;
        if (descInput) {
          descInput.focus();
          // Set cursor at the end of the text
          descInput.setSelectionRange(
            descInput.value.length,
            descInput.value.length
          );
        }
      }
    }, 100);
  };

  // Auto-fill "Created By" with current user's name (only in create mode)
  useEffect(() => {
    if (mode === "create" && session?.user && !initialData?.createdBy) {
      const userName =
        `${session.user.firstName} ${session.user.lastName}`.trim();
      setValue("createdBy", userName);
    }
  }, [session, mode, initialData, setValue]);

  // Initialize withholding state from initialData (edit mode)
  useEffect(() => {
    if (mode === "create" && session?.organization?.isWithholdingAgent) {
      setApplyWithholding(true);
      setValue("applyWithholding", true);
    }
  }, [mode, session, setValue]);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      const data = initialData as any;
      if (data.withheldPct && data.withheldPct > 0) {
        setApplyWithholding(true);
        setValue("applyWithholding", true);
      } else if (data.applyWithholding !== undefined) {
        setApplyWithholding(data.applyWithholding);
        setValue("applyWithholding", data.applyWithholding);
      }
    }
  }, [mode, initialData, setValue]);

  // Handle vendor selection
  const handleVendorSelect = (vendorId: string) => {
    setSelectedVendorId(vendorId);

    if (vendorId === "MANUAL") {
      // Manual entry - clear fields
      setValue("vendorLegalName", "");
      setValue("vendorTradeName", "");
      setValue("vendorTin", "");
      setValue("vendorVatNumber", "");
      setValue("vendorPhone", "");
      setValue("vendorSubcity", "");
      setValue("vendorCityRegion", "");
      setValue("vendorCountry", "ET");
      setSaveVendor(false);
      return;
    }

    // Find selected vendor and auto-fill
    const vendor = vendorsData?.vendors?.find((v) => v.id === vendorId);
    if (vendor) {
      setValue("vendorLegalName", vendor.legalName || "");
      setValue("vendorTradeName", vendor.tradeName || "");
      setValue("vendorTin", vendor.tin || "");
      setValue("vendorVatNumber", vendor.vatNumber || "");
      setValue("vendorPhone", vendor.phone || "");
      setValue("vendorSubcity", vendor.subcity || "");
      setValue("vendorCityRegion", vendor.cityRegion || "");
      setValue("vendorCountry", vendor.country || "ET");
      setSaveVendor(false); // Don't save again if it's an existing vendor
    }
  };

  // Save vendor if needed
  const saveVendorIfNeeded = async () => {
    if (!saveVendor || selectedVendorId !== "MANUAL") return;

    const legalName = watch("vendorLegalName");
    const tradeName = watch("vendorTradeName");

    if (!legalName && !tradeName) return;

    try {
      await createVendor.mutateAsync({
        type: "Company",
        legalName: legalName || undefined,
        tradeName: tradeName || undefined,
        tin: watch("vendorTin") || undefined,
        vatNumber: watch("vendorVatNumber") || undefined,
        phone: watch("vendorPhone") || undefined,
        subcity: watch("vendorSubcity") || undefined,
        cityRegion: watch("vendorCityRegion") || undefined,
        country: watch("vendorCountry") || "ET",
      });
    } catch (error) {
      console.error("Failed to save vendor:", error);
    }
  };

  // Calculate totals
  const calculateLineTotals = () => {
    return lines.map((line) => {
      const quantity = Number(line.quantity) || 0;
      const unitPrice = Number(line.unitPrice) || 0;
      const discountAmount = Number(line.discountAmount) || 0;
      const baseAmount = Math.round(quantity * unitPrice * 100) / 100;
      return baseAmount - discountAmount;
    });
  };

  const calculateSubtotal = () => {
    const lineTotals = calculateLineTotals();
    return lineTotals.reduce((sum, total) => sum + total, 0);
  };

  const calculateVAT = () => {
    const vatableAmount = lines.reduce((sum, line, index) => {
      if (line.isVatApplicable) {
        return sum + calculateLineTotals()[index];
      }
      return sum;
    }, 0);
    return vatableAmount * vatRate;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVAT();
  };

  const calculateWithholding = () => {
    if (!applyWithholding) return 0;
    const lineTotals = calculateLineTotals();
    const goodsSubtotal = lines.reduce((sum, line, index) => {
      return line.lineType === "Good" ? sum + lineTotals[index] : sum;
    }, 0);
    const serviceSubtotal = lines.reduce((sum, line, index) => {
      return line.lineType === "Service" ? sum + lineTotals[index] : sum;
    }, 0);
    const taxableBase =
      (goodsSubtotal > 20000 ? goodsSubtotal : 0) +
      (serviceSubtotal > 10000 ? serviceSubtotal : 0);

    return (taxableBase * 3) / 100;
  };

  const calculateNetPaid = () => {
    return calculateTotal() - calculateWithholding();
  };

  const handleFormSubmit = async (data: PurchaseBillFormData) => {
    // Save vendor if checkbox is checked
    await saveVendorIfNeeded();

    const submitData = {
      ...data,
      applyWithholding,
    } as any;

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Vendor Information */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Vendor Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Vendor Selection */}
          <div className="space-y-4 p-4 bg-brand-yellow-500/5 rounded-lg border border-brand-yellow-500/20">
            <div className="space-y-2">
              <Label htmlFor="selectVendor" className="text-gray-300">
                Select Existing Vendor
              </Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Search vendors..."
                    value={vendorSearch}
                    onChange={(e) => setVendorSearch(e.target.value)}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>
              <Select
                value={selectedVendorId}
                onValueChange={handleVendorSelect}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Choose vendor or enter manually" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MANUAL">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>None (Enter manually)</span>
                    </div>
                  </SelectItem>
                  {vendorsData?.vendors && vendorsData.vendors.length > 0 && (
                    <>
                      {vendorsData.vendors.map((vendor) => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          <div>
                            <div className="font-medium">
                              {vendor.legalName ||
                                vendor.tradeName ||
                                "Unnamed"}
                            </div>
                            {vendor.tin && (
                              <div className="text-xs text-gray-400">
                                TIN: {vendor.tin}
                              </div>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Save Vendor Checkbox */}
            {selectedVendorId === "MANUAL" && mode === "create" && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="saveVendor"
                  checked={saveVendor}
                  onCheckedChange={(checked) =>
                    setSaveVendor(checked as boolean)
                  }
                />
                <Label
                  htmlFor="saveVendor"
                  className="text-sm text-gray-300 cursor-pointer"
                >
                  Save this vendor for future use
                </Label>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendorLegalName" className="text-gray-300">
                Legal Name *
              </Label>
              <Input
                id="vendorLegalName"
                {...register("vendorLegalName")}
                className="bg-white/5 border-white/10 text-white"
              />
              {errors.vendorLegalName && (
                <p className="text-sm text-red-400">
                  {errors.vendorLegalName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendorTradeName" className="text-gray-300">
                Trade Name
              </Label>
              <Input
                id="vendorTradeName"
                {...register("vendorTradeName")}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendorTin" className="text-gray-300">
                TIN
              </Label>
              <Input
                id="vendorTin"
                {...register("vendorTin")}
                className="bg-white/5 border-white/10 text-white"
                placeholder="10 digits"
              />
              {errors.vendorTin && (
                <p className="text-sm text-red-400">
                  {errors.vendorTin.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendorVatNumber" className="text-gray-300">
                VAT Number
              </Label>
              <Input
                id="vendorVatNumber"
                {...register("vendorVatNumber")}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendorPhone" className="text-gray-300">
              Phone
            </Label>
            <Input
              id="vendorPhone"
              {...register("vendorPhone")}
              className="bg-white/5 border-white/10 text-white"
              placeholder="+251900000000"
            />
            {errors.vendorPhone && (
              <p className="text-sm text-red-400">
                {errors.vendorPhone.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendorSubcity" className="text-gray-300">
                Subcity
              </Label>
              <Input
                id="vendorSubcity"
                {...register("vendorSubcity")}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendorCityRegion" className="text-gray-300">
                City/Region
              </Label>
              <Input
                id="vendorCityRegion"
                {...register("vendorCityRegion")}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendorCountry" className="text-gray-300">
                Country
              </Label>
              <Input
                id="vendorCountry"
                {...register("vendorCountry")}
                className="bg-white/5 border-white/10 text-white"
                defaultValue="ET"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchase Details */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Purchase Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-gray-300">
              Reason for Purchase *
            </Label>
            <Textarea
              id="reason"
              {...register("reason")}
              className="bg-white/5 border-white/10 text-white"
              placeholder="Describe the reason for this purchase..."
              rows={3}
            />
            {errors.reason && (
              <p className="text-sm text-red-400">{errors.reason.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="text-gray-300">
                Payment Method *
              </Label>
              <Select
                value={watch("paymentMethod")}
                onValueChange={(value) =>
                  setValue("paymentMethod", value as any)
                }
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PaymentMethodEnum.options.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentRef" className="text-gray-300">
                Payment Reference
              </Label>
              <Input
                id="paymentRef"
                {...register("paymentRef")}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Cheque number, transaction ID, etc."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Line Items</CardTitle>
          <Button
            type="button"
            onClick={() =>
              append({
                lineType: "Good",
                description: "",
                unit: "pcs",
                quantity: 1,
                unitPrice: 0,
                discountAmount: 0,
                isVatApplicable: true,
              })
            }
            size="sm"
            variant="outline"
            className="border-brand-yellow-500/30 text-brand-yellow-500 hover:bg-brand-yellow-500/10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Line
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Add Templates */}
          <div className="p-4 bg-gradient-to-r from-brand-yellow-500/10 to-transparent border border-brand-yellow-500/20 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-brand-yellow-500" />
              <h5 className="text-sm font-medium text-white">
                Quick Add Common Purchases
              </h5>
            </div>
            <div className="flex flex-wrap gap-2">
              {PURCHASE_TEMPLATES.map((template) => (
                <Badge
                  key={template.id}
                  onClick={() => handleQuickAdd(template)}
                  className="cursor-pointer bg-white/5 hover:bg-brand-yellow-500/20 text-gray-300 hover:text-brand-yellow-400 border-white/10 hover:border-brand-yellow-500/30 transition-all px-3 py-1.5 text-sm"
                >
                  <span className="mr-1.5">{template.icon}</span>
                  {template.label}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Click a template to quickly add a pre-filled line item
            </p>
          </div>

          {/* Line Items */}
          {fields.map((field, index) => (
            <div
              key={field.id}
              data-line-item
              className="p-4 bg-white/5 rounded-lg border border-white/10 space-y-4"
            >
              <div className="flex items-start justify-between">
                <h4 className="text-white font-medium">Item {index + 1}</h4>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => remove(index)}
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Description *</Label>
                <Input
                  {...register(`lines.${index}.description` as const)}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Item description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">Line Type *</Label>
                  <Select
                    value={watch(`lines.${index}.lineType`) || "Good"}
                    onValueChange={(value) =>
                      setValue(
                        `lines.${index}.lineType`,
                        value as "Good" | "Service"
                      )
                    }
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Good">Good</SelectItem>
                      <SelectItem value="Service">Service</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Quantity *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`lines.${index}.quantity` as const, {
                      valueAsNumber: true,
                    })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Unit *</Label>
                  <Input
                    {...register(`lines.${index}.unit` as const)}
                    className="bg-white/5 border-white/10 text-white"
                    placeholder="pcs, kg, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Unit Price *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`lines.${index}.unitPrice` as const, {
                      valueAsNumber: true,
                    })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-300">Discount</Label>
                  <Input
                    type="number"
                    step="0.01"
                    {...register(`lines.${index}.discountAmount` as const, {
                      valueAsNumber: true,
                    })}
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm text-gray-300">
                  <input
                    type="checkbox"
                    {...register(`lines.${index}.isVatApplicable` as const)}
                    className="mr-2"
                  />
                  VAT Applicable
                </Label>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Line Total</p>
                  <p className="text-white font-semibold">
                    ETB {calculateLineTotals()[index].toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {errors.lines && (
            <p className="text-sm text-red-400">
              At least one line item is required
            </p>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="bg-gradient-to-br from-brand-yellow-500/10 to-transparent border-brand-yellow-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-300">Subtotal:</span>
              <span className="text-white font-medium">
                ETB {calculateSubtotal().toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-300">VAT (15%):</span>
              <span className="text-white font-medium">
                ETB {calculateVAT().toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-t border-white/10">
              <span className="text-white font-medium">Total:</span>
              <span className="text-white font-bold text-xl">
                ETB {calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>

          {/* Withholding Tax Option */}
          <div className="space-y-3 pt-4 border-t border-white/10">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="applyWithholding"
                checked={applyWithholding}
                onCheckedChange={(checked) => {
                  setApplyWithholding(checked as boolean);
                  setValue("applyWithholding", checked as boolean);
                }}
              />
              <Label
                htmlFor="applyWithholding"
                className="text-sm text-gray-300 cursor-pointer"
              >
                Apply withholding tax
              </Label>
            </div>
            <p className="text-xs text-gray-400 pl-6">
              Calculated before VAT at 3%: services over ETB 10,000 and goods
              over ETB 20,000.
            </p>

            {applyWithholding && (
              <div className="space-y-3 pl-6">
                <div className="flex justify-between items-center text-sm text-red-400">
                  <span>Withholding Tax (3%):</span>
                  <span className="font-medium">
                    -ETB {calculateWithholding().toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-t border-white/10">
                  <span className="text-brand-yellow-500 font-medium">
                    Net Paid:
                  </span>
                  <span className="text-brand-yellow-500 font-bold text-xl">
                    ETB {calculateNetPaid().toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {!applyWithholding && session?.organization?.isWithholdingAgent && (
              <div className="space-y-2 pl-6">
                <Label
                  htmlFor="withholdingOverrideReason"
                  className="text-gray-300"
                >
                  Reason WHT is not applied *
                </Label>
                <Textarea
                  id="withholdingOverrideReason"
                  {...register("withholdingOverrideReason")}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Explain why this purchase is exempt from WHT..."
                  rows={3}
                />
                {errors.withholdingOverrideReason && (
                  <p className="text-sm text-red-400">
                    {errors.withholdingOverrideReason.message}
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="createdBy" className="text-gray-300">
                Created By
              </Label>
              <Input
                id="createdBy"
                {...register("createdBy")}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Creator name"
                readOnly={mode === "create"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reviewedBy" className="text-gray-300">
                Reviewed By
              </Label>
              <Input
                id="reviewedBy"
                {...register("reviewedBy")}
                className="bg-white/5 border-white/10 text-white"
                placeholder="Reviewer name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="authorizedBy" className="text-gray-300">
              Authorized By
            </Label>
            <Input
              id="authorizedBy"
              {...register("authorizedBy")}
              className="bg-white/5 border-white/10 text-white"
              placeholder="Authorizer name"
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-4">
        {Object.keys(errors).length > 0 && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400 font-medium mb-2">
              Please fix the following errors:
            </p>
            <ul className="list-disc list-inside text-sm text-red-300 space-y-1">
              {Object.entries(errors).map(([field, error]) => (
                <li key={field}>
                  <span className="font-medium capitalize">
                    {field.replace(/([A-Z])/g, " $1").trim()}:
                  </span>{" "}
                  {error?.message?.toString() || "Invalid value"}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-brand-yellow-500 text-black hover:bg-brand-yellow-600 font-semibold"
          >
            {isLoading
              ? "Processing..."
              : mode === "create"
                ? "Create Purchase Bill"
                : "Update Purchase Bill"}
          </Button>
        </div>
      </div>
    </form>
  );
}
