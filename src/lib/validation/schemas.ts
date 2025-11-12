import { z } from "zod";

export const ethiopianPhoneRegex = /^(\+251|0)?[97]\d{8}$/;

export const uuidSchema = z.string().uuid();

export const emailSchema = z.string().email().max(255);

export const ethiopianPhoneSchema = z
  .string()
  .regex(ethiopianPhoneRegex, "Invalid Ethiopian phone number format")
  .optional()
  .or(z.literal(""));

export const tinSchema = z
  .string()
  .min(10)
  .max(10)
  .optional()
  .or(z.literal(""));

export const moneySchema = z
  .number()
  .or(z.string().transform((val) => parseFloat(val)))
  .refine((val) => !isNaN(val) && val >= 0, "Must be a valid positive number");

export const addressSchema = z.object({
  subcity: z.string().optional(),
  cityRegion: z.string().optional(),
  country: z.string().default("ET"),
});

export const MemberRoleEnum = z.enum([
  "Owner",
  "Admin",
  "Manager",
  "Staff",
  "Viewer",
]);
export const PartyTypeEnum = z.enum(["Company", "Individual"]);
export const ItemTypeEnum = z.enum(["Good", "Service"]);
export const InvoiceStatusEnum = z.enum([
  "Draft",
  "Pending",
  "Paid",
  "Overdue",
  "Cancelled",
]);
export const PaymentMethodEnum = z.enum([
  "Cash",
  "Cheque",
  "BankTransfer",
  "POS",
  "Mobile",
]);
export const GoodsOrServiceEnum = z.enum(["Goods", "Service"]);
export const PaymentDirectionEnum = z.enum(["Incoming", "Outgoing"]);
export const RelatedTypeEnum = z.enum(["Invoice", "Bill", "None"]);
export const AttachmentKindEnum = z.enum([
  "SalesPDF",
  "PaymentPDF",
  "PurchasePDF",
  "Logo",
  "Other",
]);
export const DocTypeEnum = z.enum(["CS", "PV", "PB"]);

/**
 * Strong password schema with OWASP recommendations:
 * - 8-24 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(24, "Password must not exceed 24 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: ethiopianPhoneSchema,
  orgCode: z
    .string()
    .min(2)
    .max(20)
    .regex(/^[A-Z0-9]+$/, "Must be uppercase letters and numbers only"),
  orgLegalName: z.string().min(2).max(255),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
  email: emailSchema,
  otp: z
    .string()
    .length(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "OTP must be numeric"),
});

export const resendVerificationOtpSchema = z.object({
  email: emailSchema,
});

export const requestPasswordResetSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(32),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const createOrganizationSchema = z.object({
  code: z
    .string()
    .min(2)
    .max(20)
    .regex(/^[A-Z0-9]+$/),
  legalName: z.string().min(2).max(255),
  tradeName: z.string().max(255).optional(),
  subcity: z.string().max(100).optional(),
  cityRegion: z.string().max(100).optional(),
  country: z.string().default("ET"),
  tin: tinSchema,
  vatNumber: z.string().max(50).optional(),
  phone: ethiopianPhoneSchema,
  email: emailSchema.optional(),
  website: z.string().url().optional().or(z.literal("")),
});

export const updateOrganizationSchema = createOrganizationSchema.partial();

export const partySchema = z.object({
  type: PartyTypeEnum,
  legalName: z.string().min(1).max(255).optional(),
  tradeName: z.string().max(255).optional(),
  subcity: z.string().max(100).optional(),
  cityRegion: z.string().max(100).optional(),
  country: z.string().default("ET"),
  tin: tinSchema,
  vatNumber: z.string().max(50).optional(),
  phone: ethiopianPhoneSchema,
  email: emailSchema.optional(),
  contactPerson: z.string().max(255).optional(),
  notes: z.string().optional(),
});

export const createCustomerSchema = partySchema;
export const updateCustomerSchema = partySchema.partial();

export const createVendorSchema = partySchema;
export const updateVendorSchema = partySchema.partial();

export const createItemSchema = z.object({
  type: ItemTypeEnum,
  code: z.string().min(1).max(50),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  unit: z.string().min(1).max(50),
  sku: z.string().max(100).optional(),
  barcode: z.string().max(100).optional(),
  defaultPrice: moneySchema,
  vatApplicable: z.boolean().default(true),
  isActive: z.boolean().default(true),
});

export const updateItemSchema = createItemSchema.partial();

export const createTaxRateSchema = z.object({
  name: z.string().min(1).max(100),
  ratePct: z.number().min(0).max(100),
  isDefault: z.boolean().default(false),
});

export const updateTaxRateSchema = createTaxRateSchema.partial();

export const salesInvoiceLineSchema = z.object({
  itemId: uuidSchema.optional(),
  description: z.string().min(1).max(500),
  unit: z.string().min(1).max(50),
  quantity: z.number().positive(),
  unitPrice: moneySchema,
  isVatApplicable: z.boolean().default(true),
});

export const createSalesInvoiceSchema = z.object({
  buyerType: PartyTypeEnum.optional(),
  buyerLegalName: z.string().max(255).optional(),
  buyerTradeName: z.string().max(255).optional(),
  buyerSubcity: z.string().max(100).optional(),
  buyerCityRegion: z.string().max(100).optional(),
  buyerCountry: z.string().default("ET").optional(),
  buyerTin: tinSchema,
  buyerVatNumber: z.string().max(50).optional(),
  buyerPhone: ethiopianPhoneSchema,

  goodsOrService: GoodsOrServiceEnum,
  paymentMethod: PaymentMethodEnum,
  paymentRef: z.string().max(255).optional(),

  status: InvoiceStatusEnum.optional(),

  lines: z.array(salesInvoiceLineSchema).min(1),

  createdBy: z.string().max(255).optional(),
  reviewedBy: z.string().max(255).optional(),
  authorizedBy: z.string().max(255).optional(),
  receivedBy: z.string().max(255).optional(),

  notes: z.string().optional(),
});

export const updateSalesInvoiceSchema = createSalesInvoiceSchema.partial();

export const purchaseBillLineSchema = z.object({
  itemId: uuidSchema.optional(),
  description: z.string().min(1).max(500),
  unit: z.string().min(1).max(50),
  quantity: z.number().positive(),
  unitPrice: moneySchema,
  discountAmount: moneySchema.default(0),
  isVatApplicable: z.boolean().default(true),
});

export const createPurchaseBillSchema = z.object({
  vendorLegalName: z.string().max(255).optional(),
  vendorTradeName: z.string().max(255).optional(),
  vendorSubcity: z.string().max(100).optional(),
  vendorCityRegion: z.string().max(100).optional(),
  vendorCountry: z.string().default("ET").optional(),
  vendorTin: tinSchema,
  vendorVatNumber: z.string().max(50).optional(),
  vendorPhone: ethiopianPhoneSchema,

  reason: z.string().min(1),
  paymentMethod: PaymentMethodEnum,
  paymentRef: z.string().max(255).optional(),

  lines: z.array(purchaseBillLineSchema).min(1),

  createdBy: z.string().max(255).optional(),
  reviewedBy: z.string().max(255).optional(),
  authorizedBy: z.string().max(255).optional(),
});

export const updatePurchaseBillSchema = createPurchaseBillSchema.partial();

export const createPaymentSchema = z.object({
  direction: PaymentDirectionEnum,
  method: PaymentMethodEnum,
  amount: moneySchema,
  relatedType: RelatedTypeEnum,
  relatedId: uuidSchema.optional(),

  createdBy: z.string().max(255).optional(),
  reviewedBy: z.string().max(255).optional(),
  authorizedBy: z.string().max(255).optional(),
});

export const updatePaymentSchema = createPaymentSchema.partial();

export const inviteMemberSchema = z.object({
  email: emailSchema,
  role: MemberRoleEnum,
});

export const updateMemberSchema = z.object({
  role: MemberRoleEnum.optional(),
  isActive: z.boolean().optional(),
});

export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const dateRangeSchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});
