"use client";

import { useMemo, useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Trash2,
  Calculator,
  Users,
  Package,
  Calendar as CalendarIcon,
} from "lucide-react";
import { format } from "date-fns";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  createSalesInvoiceSchema,
  createProformaInvoiceSchema,
  PartyTypeEnum,
  GoodsOrServiceEnum,
  PaymentMethodEnum,
  InvoiceStatusEnum,
  InvoiceTypeEnum,
} from "@/lib/validation/schemas";
import {
  useCustomerLedger,
  useCustomers,
  useCreateCustomer,
} from "@/lib/hooks/use-customers";
import { useSession } from "@/lib/hooks/use-session";
import { type Item, useItems } from "@/lib/hooks/use-items";

type InvoiceFormData = z.infer<typeof createSalesInvoiceSchema>;

interface InvoiceFormProps {
  initialData?: Partial<InvoiceFormData>;
  onSubmit: (data: InvoiceFormData) => void;
  onSaveDraft?: (data: InvoiceFormData) => void;
  isLoading?: boolean;
  mode?: "create" | "edit";
  documentKind?: "invoice" | "proforma";
}

export function InvoiceForm({
  initialData,
  onSubmit,
  onSaveDraft,
  isLoading = false,
  mode = "create",
  documentKind = "invoice",
}: InvoiceFormProps) {
  const [vatRate] = useState(0.15);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [saveAsCustomer, setSaveAsCustomer] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [applyWithholding, setApplyWithholding] = useState(false);

  const { data: customersData } = useCustomers(customerSearch);
  const createCustomer = useCreateCustomer();
  const customers = customersData?.customers || [];
  const selectedCustomerLedgerId =
    selectedCustomerId && selectedCustomerId !== "WALK_IN"
      ? selectedCustomerId
      : undefined;
  const { data: selectedCustomerLedger } = useCustomerLedger(
    selectedCustomerLedgerId
  );
  const { data: session } = useSession();
  const { data: itemsData } = useItems({ isActive: true, limit: 100 });
  const items = itemsData?.items || [];

  const today = new Date();
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  const formSchema = useMemo(
    () =>
      documentKind === "proforma"
        ? createProformaInvoiceSchema
        : createSalesInvoiceSchema,
    [documentKind]
  );

  const formatCurrency = (amount: number): string => {
    return `ETB ${new Intl.NumberFormat("en-ET", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)}`;
  };

  const {
    register,
    control,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      lines: [
        {
          lineType: "Good",
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
      invoiceType: "Cash",
      invoiceDate: today,
      dueDate: today,
      status: "Pending",
      applyWithholding: false,
    },
  });

  useEffect(() => {
    const data = initialData as any;
    if (data?.applyWithholding !== undefined) {
      setApplyWithholding(data.applyWithholding);
      setValue("applyWithholding", data.applyWithholding);
    } else if (data?.withheldPct && data.withheldPct > 0) {
      setApplyWithholding(true);
      setValue("applyWithholding", true);
    }
  }, [initialData, setValue]);

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

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "lines",
  });

  const lines = watch("lines");
  const buyerType = watch("buyerType");
  const goodsOrService = watch("goodsOrService");
  const invoiceType = watch("invoiceType");
  const invoiceDate = watch("invoiceDate");
  const dueDate = watch("dueDate");
  const paidDate = watch("paidDate");

  // Adjust due date when invoice type changes
  useEffect(() => {
    if (invoiceType === "Cash" && invoiceDate) {
      setValue("dueDate", invoiceDate);
    } else if (invoiceType === "Credit" && invoiceDate) {
      const creditDueDate = new Date(invoiceDate);
      creditDueDate.setDate(creditDueDate.getDate() + 30);
      setValue("dueDate", creditDueDate);
    }
  }, [invoiceType, invoiceDate, setValue]);

  // Handle quick-add product selection
  const isBlankLine = (line: InvoiceFormData["lines"][number]): boolean => {
    return (
      !line.itemId &&
      !line.description?.trim() &&
      Number(line.quantity || 0) === 1 &&
      Number(line.unitPrice || 0) === 0
    );
  };

  const handleQuickAddProduct = (item: Item): void => {
    const productLine = {
      description:
        item.name + (item.description ? ` - ${item.description}` : ""),
      itemId: item.id,
      lineType: item.type || "Good",
      unit: item.unit,
      quantity: 1,
      unitPrice: Number(item.defaultPrice),
      isVatApplicable: item.vatApplicable,
    };

    const currentLines = getValues("lines");
    const blankLineIndex = currentLines.findIndex(isBlankLine);
    const nextLines =
      blankLineIndex >= 0
        ? currentLines.map((line, index) =>
            index === blankLineIndex ? productLine : line
          )
        : [...currentLines, productLine];
    const normalizedLines = nextLines.filter(
      (line, index) => index === blankLineIndex || !isBlankLine(line)
    );
    const targetIndex =
      blankLineIndex >= 0
        ? normalizedLines.findIndex((line) => line.itemId === item.id)
        : normalizedLines.length - 1;

    replace(normalizedLines);

    setTimeout(() => {
      const lineItems = document.querySelectorAll("[data-line-item]");
      const selectedItem = lineItems[targetIndex];
      if (selectedItem) {
        selectedItem.scrollIntoView({ behavior: "smooth", block: "center" });
        const qtyInput = selectedItem.querySelector(
          'input[type="number"]'
        ) as HTMLInputElement;
        if (qtyInput) {
          qtyInput.focus();
          qtyInput.select();
        }
      }
    }, 100);
  };

  const visibleItems = useMemo(() => {
    const normalizedSearch = productSearch.trim().toLowerCase();
    if (!normalizedSearch) return items.slice(0, 20);

    return items
      .filter((item) => {
        return [
          item.name,
          item.code,
          item.description || "",
          item.sku || "",
          item.barcode || "",
        ].some((value) => value.toLowerCase().includes(normalizedSearch));
      })
      .slice(0, 20);
  }, [items, productSearch]);

  const calculateLineTotals = () => {
    return lines.map((line) => {
      const quantity = Number(line.quantity) || 0;
      const unitPrice = Number(line.unitPrice) || 0;
      return Math.round(quantity * unitPrice * 100) / 100;
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
    if (applyWithholding) {
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

      return taxableBase * 0.03;
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
    const normalizedLines = data.lines.filter((line) => !isBlankLine(line));
    const draftData = {
      ...data,
      lines: normalizedLines.length > 0 ? normalizedLines : data.lines,
    };

    await saveCustomerIfNeeded(draftData);

    if (onSaveDraft) {
      onSaveDraft({ ...draftData, status: "Draft" });
    }
  };

  const handleFormSubmit = async (data: InvoiceFormData) => {
    try {
      const normalizedLines = data.lines.filter((line) => !isBlankLine(line));
      const submitData = {
        ...data,
        lines: normalizedLines.length > 0 ? normalizedLines : data.lines,
      };

      await saveCustomerIfNeeded(submitData);

      onSubmit(submitData);
    } catch (error) {
      throw error;
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Invoice Type and Dates */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Invoice Type & Dates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceType" className="text-gray-300">
                {documentKind === "proforma"
                  ? "Accepted As *"
                  : "Invoice Type *"}
              </Label>
              <Select
                value={watch("invoiceType")}
                onValueChange={(value) =>
                  setValue("invoiceType", value as "Cash" | "Credit")
                }
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {InvoiceTypeEnum.options.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type === "Cash"
                        ? "Cash Sales Attachment"
                        : "Credit Invoice"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.invoiceType && (
                <p className="text-sm text-red-400">
                  {errors.invoiceType.message}
                </p>
              )}
              <p className="text-xs text-gray-400">
                {documentKind === "proforma"
                  ? "Quote only. Choose what this should become if accepted."
                  : invoiceType === "Cash"
                    ? "Payment received immediately, attached to fiscal receipt"
                    : "Payment due on a future date, allows credit terms"}
              </p>
            </div>
          </div>

          {documentKind === "invoice" && invoiceType === "Cash" && (
            <div className="space-y-2">
              <Label htmlFor="fiscalReceiptNumber" className="text-gray-300">
                FS Number *
              </Label>
              <Input
                id="fiscalReceiptNumber"
                {...register("fiscalReceiptNumber")}
                className="bg-white/5 border-white/10 text-white font-mono"
                placeholder="Fiscal sales receipt number"
              />
              {errors.fiscalReceiptNumber && (
                <p className="text-sm text-red-400">
                  {errors.fiscalReceiptNumber.message}
                </p>
              )}
              <p className="text-xs text-gray-400">
                Required before saving a Cash Sales Attachment.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Invoice Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left bg-white/5 border-white/10 text-white hover:bg-white/10"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {invoiceDate ? format(invoiceDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={invoiceDate}
                    onSelect={(date) => date && setValue("invoiceDate", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.invoiceDate && (
                <p className="text-sm text-red-400">
                  {errors.invoiceDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Due Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left bg-white/5 border-white/10 text-white hover:bg-white/10"
                    disabled={invoiceType === "Cash"}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={(date) => date && setValue("dueDate", date)}
                    disabled={(date) =>
                      invoiceDate ? date < invoiceDate : false
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.dueDate && (
                <p className="text-sm text-red-400">{errors.dueDate.message}</p>
              )}
              {invoiceType === "Cash" && (
                <p className="text-xs text-gray-400">
                  Same as invoice date for cash sales
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">Paid Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left bg-white/5 border-white/10 text-white hover:bg-white/10"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {paidDate ? format(paidDate, "PPP") : "Not paid yet"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={paidDate}
                    onSelect={(date) => setValue("paidDate", date || undefined)}
                    disabled={(date) =>
                      invoiceDate ? date < invoiceDate : false
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {paidDate && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setValue("paidDate", undefined)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Clear date
                </Button>
              )}
              {errors.paidDate && (
                <p className="text-sm text-red-400">
                  {errors.paidDate.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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

              {selectedCustomerLedger && (
                <div className="grid grid-cols-1 gap-3 border-t border-brand-yellow-500/20 pt-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-gray-400">Outstanding</p>
                    <p className="text-sm font-semibold text-white">
                      {formatCurrency(
                        selectedCustomerLedger.summary.outstanding
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Overdue</p>
                    <p className="text-sm font-semibold text-red-300">
                      {formatCurrency(selectedCustomerLedger.summary.overdue)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Documents</p>
                    <p className="text-sm font-semibold text-white">
                      {selectedCustomerLedger.summary.invoiceCount} invoices
                    </p>
                  </div>
                </div>
              )}
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

          {buyerType === "Company" && (
            <div className="flex items-start space-x-3 p-4 bg-white/5 rounded-lg border border-white/10">
              <Checkbox
                id="applyWithholding"
                checked={applyWithholding}
                onCheckedChange={(checked) => {
                  setApplyWithholding(checked as boolean);
                  setValue("applyWithholding", checked as boolean);
                }}
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
                  Check this if the payer will deduct WHT. It is calculated
                  before VAT: services over ETB 10,000 and goods over ETB
                  20,000.
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
                lineType: "Good",
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
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-brand-yellow-500" />
                    <h5 className="text-sm font-medium text-white">
                      Quick Add Products
                    </h5>
                    <span className="text-xs text-gray-500">
                      ({items.length} available)
                    </span>
                  </div>
                  <Input
                    value={productSearch}
                    onChange={(event) => setProductSearch(event.target.value)}
                    placeholder="Search catalog..."
                    className="h-9 bg-white/5 border-white/10 text-white placeholder:text-gray-500 sm:max-w-xs"
                    autoComplete="off"
                  />
                </div>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {visibleItems.length > 0 ? (
                    visibleItems.map((item) => (
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
                    ))
                  ) : (
                    <p className="text-sm text-gray-400">
                      No matching active products.
                    </p>
                  )}
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
                  <div className="md:col-span-4 space-y-2">
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

                  <div className="md:col-span-1 space-y-2">
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
          {applyWithholding && buyerType === "Company" && (
              <>
                <div className="flex justify-between items-center py-2 text-red-400">
                  <span>Withholding Tax (3%):</span>
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
