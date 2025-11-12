"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2, Calculator, Users, Package } from "lucide-react";
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
  createSalesInvoiceSchema,
  PartyTypeEnum,
  GoodsOrServiceEnum,
  PaymentMethodEnum,
  InvoiceStatusEnum,
} from "@/lib/validation/schemas";
import { useCustomers, useCreateCustomer } from "@/lib/hooks/use-customers";
import { useSession } from "@/lib/hooks/use-session";
import { useItems } from "@/lib/hooks/use-items";

type InvoiceFormData = z.infer<typeof createSalesInvoiceSchema>;

interface InvoiceFormProps {
  initialData?: Partial<InvoiceFormData>;
  onSubmit: (data: InvoiceFormData) => void;
  onSaveDraft?: (data: InvoiceFormData) => void;
  isLoading?: boolean;
  mode?: "create" | "edit";
}

export function InvoiceForm({
  initialData,
  onSubmit,
  onSaveDraft,
  isLoading = false,
  mode = "create",
}: InvoiceFormProps) {
  const [vatRate] = useState(0.15);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [saveAsCustomer, setSaveAsCustomer] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [applyWithholding, setApplyWithholding] = useState(false);

  const { data: customersData } = useCustomers(customerSearch);
  const createCustomer = useCreateCustomer();
  const customers = customersData?.customers || [];
  const { data: session } = useSession();
  const { data: itemsData } = useItems({ isActive: true, limit: 100 });
  const items = (itemsData as any)?.items || [];

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(createSalesInvoiceSchema),
    defaultValues: initialData || {
      lines: [
        {
          description: "",
          unit: "pcs",
          quantity: 1,
          unitPrice: 0,
          isVatApplicable: true,
        },
      ],
      buyerType: "Company",
      goodsOrService: "Goods",
      paymentMethod: "Cash",
      buyerCountry: "ET",
      status: "Pending",
    },
  });

  useEffect(() => {
    const data = initialData as any;
    if (data?.withheldPct && data.withheldPct > 0) {
      setApplyWithholding(true);
    }
  }, [initialData]);

  useEffect(() => {
    if (mode === "create" && session?.user && !initialData?.createdBy) {
      const userName =
        `${session.user.firstName} ${session.user.lastName}`.trim();
      setValue("createdBy", userName);
    }
  }, [session, mode, initialData, setValue]);

  // Handle customer selection
  const handleCustomerSelect = (customerId: string) => {
    if (!customerId || customerId === "MANUAL") {
      setSelectedCustomerId("");
      return;
    }

    // Handle walk-in customer
    if (customerId === "WALK_IN") {
      setSelectedCustomerId(customerId);
      setValue("buyerType", "Individual");
      setValue("buyerLegalName", "Walk-in Customer");
      setValue("buyerTradeName", "");
      setValue("buyerSubcity", "");
      setValue("buyerCityRegion", "");
      setValue("buyerCountry", "ET");
      setValue("buyerTin", "0000000000"); // Generic TIN for walk-ins
      setValue("buyerVatNumber", "");
      setValue("buyerPhone", "+251900000000"); // Generic phone
      return;
    }

    const customer = customers.find((c) => c.id === customerId);
    if (customer) {
      setSelectedCustomerId(customerId);
      setValue("buyerType", customer.type);
      setValue("buyerLegalName", customer.legalName || "");
      setValue("buyerTradeName", customer.tradeName || "");
      setValue("buyerSubcity", customer.subcity || "");
      setValue("buyerCityRegion", customer.cityRegion || "");
      setValue("buyerCountry", customer.country || "ET");
      setValue("buyerTin", customer.tin || "");
      setValue("buyerVatNumber", customer.vatNumber || "");
      setValue("buyerPhone", customer.phone || "");
    }
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const lines = watch("lines");
  const buyerType = watch("buyerType");
  const goodsOrService = watch("goodsOrService");

  // Handle quick-add product selection
  const handleQuickAddProduct = (item: any) => {
    append({
      description:
        item.name + (item.description ? ` - ${item.description}` : ""),
      unit: item.unit,
      quantity: 1,
      unitPrice: Number(item.defaultPrice),
      isVatApplicable: item.vatApplicable,
    });

    // Scroll to the newly added item
    setTimeout(() => {
      const lineItems = document.querySelectorAll("[data-line-item]");
      const lastItem = lineItems[lineItems.length - 1];
      if (lastItem) {
        lastItem.scrollIntoView({ behavior: "smooth", block: "center" });
        // Focus on the quantity field for easy adjustment
        const qtyInput = lastItem.querySelector(
          'input[type="number"]'
        ) as HTMLInputElement;
        if (qtyInput) {
          qtyInput.focus();
          qtyInput.select();
        }
      }
    }, 100);
  };

  const calculateLineTotals = () => {
    return lines.map((line) => {
      const quantity = Number(line.quantity) || 0;
      const unitPrice = Number(line.unitPrice) || 0;
      return quantity * unitPrice;
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

  const calculateWithholding = () => {
    if (buyerType === "Company" && goodsOrService === "Service") {
      const subtotal = calculateSubtotal();
      return subtotal * 0.02; // 2% withholding
    }
    return 0;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateVAT();
  };

  const calculateNetPayable = () => {
    return calculateTotal() - calculateWithholding();
  };

  const saveCustomerIfNeeded = async (data: InvoiceFormData) => {
    if (
      saveAsCustomer &&
      !selectedCustomerId &&
      data.buyerLegalName !== "Walk-in Customer"
    ) {
      try {
        await createCustomer.mutateAsync({
          type: data.buyerType as "Company" | "Individual",
          legalName: data.buyerLegalName,
          tradeName: data.buyerTradeName,
          subcity: data.buyerSubcity,
          cityRegion: data.buyerCityRegion,
          country: data.buyerCountry || "ET",
          tin: data.buyerTin,
          vatNumber: data.buyerVatNumber,
          phone: data.buyerPhone,
        });
      } catch (error: any) {
        throw error;
      }
    }
  };

  const handleSaveDraft = async () => {
    const data = watch();

    await saveCustomerIfNeeded(data);

    if (onSaveDraft) {
      onSaveDraft({ ...data, status: "Draft" });
    }
  };

  const handleFormSubmit = async (data: InvoiceFormData) => {
    try {
      await saveCustomerIfNeeded(data);

      onSubmit(data);
    } catch (error) {
      throw error;
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            Buyer Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === "create" && (
            <div className="p-4 rounded-lg bg-brand-yellow-500/10 border border-brand-yellow-500/20 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="customer" className="text-gray-300">
                  Select Existing Customer (Optional)
                </Label>
                <Select
                  value={selectedCustomerId}
                  onValueChange={handleCustomerSelect}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue placeholder="Search or select a customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="p-2">
                      <Input
                        placeholder="Search customers..."
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="mb-2 bg-white/5 border-white/10 text-white"
                      />
                    </div>
                    <SelectItem value="MANUAL">
                      None (Enter manually)
                    </SelectItem>
                    <SelectItem
                      value="WALK_IN"
                      className="bg-blue-500/10 font-medium"
                    >
                      🚶 Walk-in Customer (Individual)
                    </SelectItem>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.legalName || customer.tradeName}
                        {customer.tin && ` (TIN: ${customer.tin})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {!selectedCustomerId || selectedCustomerId === "" ? (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="saveAsCustomer"
                    checked={saveAsCustomer}
                    onCheckedChange={(checked) =>
                      setSaveAsCustomer(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="saveAsCustomer"
                    className="text-sm text-gray-300 cursor-pointer"
                  >
                    Save this buyer as a customer for future invoices
                  </Label>
                </div>
              ) : selectedCustomerId === "WALK_IN" ? (
                <p className="text-sm text-blue-400">
                  ℹ️ Walk-in customer details are pre-filled with generic
                  values. You can modify them if needed.
                </p>
              ) : null}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buyerType" className="text-gray-300">
                Buyer Type *
              </Label>
              <Select
                value={watch("buyerType")}
                onValueChange={(value) =>
                  setValue("buyerType", value as "Company" | "Individual")
                }
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PartyTypeEnum.options.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.buyerType && (
                <p className="text-sm text-red-400">
                  {errors.buyerType.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyerTin" className="text-gray-300">
                TIN *
              </Label>
              <Input
                id="buyerTin"
                {...register("buyerTin")}
                className="bg-white/5 border-white/10 text-white"
                placeholder="0000000000"
              />
              {errors.buyerTin && (
                <p className="text-sm text-red-400">
                  {errors.buyerTin.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buyerLegalName" className="text-gray-300">
                Legal Name
              </Label>
              <Input
                id="buyerLegalName"
                {...register("buyerLegalName")}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyerTradeName" className="text-gray-300">
                Trade Name
              </Label>
              <Input
                id="buyerTradeName"
                {...register("buyerTradeName")}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buyerPhone" className="text-gray-300">
                Phone *
              </Label>
              <Input
                id="buyerPhone"
                {...register("buyerPhone")}
                className="bg-white/5 border-white/10 text-white"
                placeholder="+251900000000"
              />
              {errors.buyerPhone && (
                <p className="text-sm text-red-400">
                  {errors.buyerPhone.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyerVatNumber" className="text-gray-300">
                VAT Number
              </Label>
              <Input
                id="buyerVatNumber"
                {...register("buyerVatNumber")}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buyerSubcity" className="text-gray-300">
                Subcity
              </Label>
              <Input
                id="buyerSubcity"
                {...register("buyerSubcity")}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyerCityRegion" className="text-gray-300">
                City/Region
              </Label>
              <Input
                id="buyerCityRegion"
                {...register("buyerCityRegion")}
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyerCountry" className="text-gray-300">
                Country
              </Label>
              <Input
                id="buyerCountry"
                {...register("buyerCountry")}
                className="bg-white/5 border-white/10 text-white"
                defaultValue="ET"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="goodsOrService" className="text-gray-300">
                Type *
              </Label>
              <Select
                value={watch("goodsOrService")}
                onValueChange={(value) =>
                  setValue("goodsOrService", value as "Goods" | "Service")
                }
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GoodsOrServiceEnum.options.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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

          {/* Withholding Tax Option */}
          {buyerType === "Company" && goodsOrService === "Service" && (
            <div className="flex items-start space-x-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <Checkbox
                id="applyWithholding"
                checked={applyWithholding}
                onCheckedChange={(checked) =>
                  setApplyWithholding(checked as boolean)
                }
                className="mt-1 border-white/20 data-[state=checked]:bg-brand-yellow-500 data-[state=checked]:text-black"
              />
              <div className="flex-1">
                <Label
                  htmlFor="applyWithholding"
                  className="text-gray-300 font-medium cursor-pointer"
                >
                  Apply Withholding Tax (3%)
                </Label>
                <p className="text-sm text-gray-400 mt-1">
                  Check this box if the buyer will withhold 3% tax from the
                  payment
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/5 border-white/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Line Items</CardTitle>
          <Button
            type="button"
            onClick={() =>
              append({
                description: "",
                unit: "pcs",
                quantity: 1,
                unitPrice: 0,
                isVatApplicable: true,
              })
            }
            size="sm"
            className="bg-brand-yellow-500 text-black hover:bg-brand-yellow-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Line
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Quick Add Products */}
            {items.length > 0 && (
              <div className="p-4 bg-gradient-to-r from-brand-yellow-500/10 to-transparent border border-brand-yellow-500/20 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Package className="h-4 w-4 text-brand-yellow-500" />
                  <h5 className="text-sm font-medium text-white">
                    Quick Add Products
                  </h5>
                  <span className="text-xs text-gray-500">
                    ({items.length} products available)
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {items.slice(0, 20).map((item: any) => (
                    <Badge
                      key={item.id}
                      onClick={() => handleQuickAddProduct(item)}
                      className="cursor-pointer bg-white/5 hover:bg-brand-yellow-500/20 text-gray-300 hover:text-brand-yellow-400 border-white/10 hover:border-brand-yellow-500/30 transition-all px-3 py-1.5 text-sm"
                    >
                      {item.name}
                      <span className="ml-2 text-xs opacity-70">
                        ETB {Number(item.defaultPrice).toFixed(2)}
                      </span>
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Click a product to add with default price (adjustable after
                  adding)
                </p>
              </div>
            )}

            {/* Line Items */}
            {fields.map((field, index) => (
              <div
                key={field.id}
                data-line-item
                className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">
                    Item #{index + 1}
                  </span>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remove(index)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-5 space-y-2">
                    <Label className="text-gray-300">Description *</Label>
                    <Input
                      {...register(`lines.${index}.description`)}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="Item description"
                    />
                    {errors.lines?.[index]?.description && (
                      <p className="text-sm text-red-400">
                        {errors.lines[index]?.description?.message}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-gray-300">Unit *</Label>
                    <Input
                      {...register(`lines.${index}.unit`)}
                      className="bg-white/5 border-white/10 text-white"
                      placeholder="pcs"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-gray-300">Quantity *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`lines.${index}.quantity`, {
                        valueAsNumber: true,
                      })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <Label className="text-gray-300">Unit Price *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      {...register(`lines.${index}.unitPrice`, {
                        valueAsNumber: true,
                      })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                  </div>

                  <div className="md:col-span-1 flex items-end">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`vat-${index}`}
                        checked={watch(`lines.${index}.isVatApplicable`)}
                        onCheckedChange={(checked) =>
                          setValue(
                            `lines.${index}.isVatApplicable`,
                            checked as boolean
                          )
                        }
                      />
                      <Label
                        htmlFor={`vat-${index}`}
                        className="text-gray-300 text-xs"
                      >
                        VAT
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="text-right">
                    <span className="text-xs text-gray-400">Line Total: </span>
                    <span className="text-lg font-bold text-white">
                      ETB {calculateLineTotals()[index].toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-brand-yellow-500/10 to-transparent border-brand-yellow-500/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Invoice Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
          {applyWithholding &&
            buyerType === "Company" &&
            goodsOrService === "Service" && (
              <>
                <div className="flex justify-between items-center py-2 text-red-400">
                  <span>Withholding Tax (2%):</span>
                  <span className="font-medium">
                    -ETB {calculateWithholding().toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-t border-white/10">
                  <span className="text-brand-yellow-500 font-medium">
                    Net Payable:
                  </span>
                  <span className="text-brand-yellow-500 font-bold text-xl">
                    ETB {calculateNetPayable().toFixed(2)}
                  </span>
                </div>
              </>
            )}
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-gray-300">
              Notes
            </Label>
            <Textarea
              id="notes"
              {...register("notes")}
              className="bg-white/5 border-white/10 text-white"
              placeholder="Additional notes or terms..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="createdBy" className="text-gray-300">
                Created By
              </Label>
              <div className="flex gap-2">
                <Input
                  id="createdBy"
                  {...register("createdBy")}
                  className="bg-white/5 border-white/10 text-white flex-1"
                  placeholder="Creator name"
                  readOnly={mode === "create"}
                />
                {mode === "create" && session?.user && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const userName =
                        `${session.user.firstName} ${session.user.lastName}`.trim();
                      setValue("createdBy", userName);
                    }}
                    className="border-white/20 text-white hover:bg-white/5 whitespace-nowrap"
                  >
                    Fill Me
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receivedBy" className="text-gray-300">
                Received By
              </Label>
              <div className="flex gap-2">
                <Input
                  id="receivedBy"
                  {...register("receivedBy")}
                  className="bg-white/5 border-white/10 text-white flex-1"
                  placeholder="Receiver name"
                />
                {session?.user && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const userName =
                        `${session.user.firstName} ${session.user.lastName}`.trim();
                      setValue("receivedBy", userName);
                    }}
                    className="border-white/20 text-white hover:bg-white/5 whitespace-nowrap"
                  >
                    Fill Me
                  </Button>
                )}
              </div>
            </div>
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
          {onSaveDraft && (
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isLoading}
              className="border-white/20 text-white hover:bg-white/5"
            >
              Save as Draft
            </Button>
          )}
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-brand-yellow-500 text-black hover:bg-brand-yellow-600 font-semibold"
          >
            {isLoading
              ? "Processing..."
              : mode === "create"
                ? "Create Invoice"
                : "Update Invoice"}
          </Button>
        </div>
      </div>
    </form>
  );
}
