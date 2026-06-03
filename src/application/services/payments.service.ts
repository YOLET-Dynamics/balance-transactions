import { paymentsRepository } from "@/infrastructure/repositories/payments.repository.impl";
import type {
  Payment,
  PaymentDirection,
  RelatedType,
  ListOptions,
} from "@/domain/repositories/payments.repository";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/lib/utils/errors";
import { withTenantContext } from "@/infrastructure/database/prisma";

interface CreatePaymentInput {
  direction: PaymentDirection;
  method: string;
  amount: number;
  currency?: string;
  relatedType: RelatedType;
  relatedId?: string;
  advanceReceiptNumber?: string;
  fiscalReceiptNumber?: string;
  createdBy?: string;
  reviewedBy?: string;
  authorizedBy?: string;
}

class PaymentsService {
  private paymentsRepo = paymentsRepository;
  private moneyEpsilon = 0.005;

  private serializePayment(payment: any): Payment {
    return {
      ...payment,
      amount: payment.amount ? Number(payment.amount) : 0,
      createdAt: payment.createdAt ? payment.createdAt.toISOString() : null,
      updatedAt: payment.updatedAt ? payment.updatedAt.toISOString() : null,
    };
  }

  async createPayment(
    orgId: string,
    input: CreatePaymentInput
  ): Promise<Payment> {
    if (
      input.direction === "Incoming" &&
      input.relatedType === "Invoice" &&
      input.relatedId
    ) {
      return await this.createInvoicePayment(orgId, input);
    }

    const paymentData = {
      direction: input.direction,
      method: input.method,
      amount: input.amount,
      currency: input.currency || "ETB",
      relatedType: input.relatedType,
      relatedId: input.relatedId || null,
      advanceReceiptNumber: input.advanceReceiptNumber?.trim() || null,
      createdBy: input.createdBy,
      reviewedBy: input.reviewedBy,
      authorizedBy: input.authorizedBy,
    };

    return await this.paymentsRepo.create(orgId, paymentData);
  }

  private async createInvoicePayment(
    orgId: string,
    input: CreatePaymentInput
  ): Promise<Payment> {
    return await withTenantContext(orgId, async (tx) => {
      const invoice = await tx.salesInvoice.findFirst({
        where: {
          id: input.relatedId,
          orgId,
          kind: "Invoice",
        },
      });

      if (!invoice) {
        throw new NotFoundError("Invoice not found");
      }

      if (invoice.status === "Paid") {
        throw new ValidationError("Invoice is already paid");
      }

      const paid = await tx.payment.aggregate({
        where: {
          orgId,
          direction: "Incoming",
          relatedType: "Invoice",
          relatedId: input.relatedId,
        },
        _sum: { amount: true },
      });

      const amountPaid = Number(paid._sum.amount || 0);
      const balanceDue = Number(invoice.netPayable) - amountPaid;

      if (input.amount <= 0) {
        throw new ValidationError("Payment amount must be greater than zero", {
          amount: ["Payment amount must be greater than zero"],
        });
      }

      if (input.amount > balanceDue + this.moneyEpsilon) {
        throw new ValidationError("Payment exceeds invoice balance", {
          amount: ["Payment exceeds invoice balance"],
        });
      }

      const isFinalPayment = input.amount >= balanceDue - this.moneyEpsilon;
      const fiscalReceiptNumber = input.fiscalReceiptNumber?.trim();
      const advanceReceiptNumber = input.advanceReceiptNumber?.trim();

      if (isFinalPayment && !fiscalReceiptNumber) {
        throw new ValidationError(
          "FS number is required for the final invoice payment",
          {
            fiscalReceiptNumber: [
              "FS number is required for the final invoice payment",
            ],
          }
        );
      }

      if (!isFinalPayment && !advanceReceiptNumber) {
        throw new ValidationError(
          "Advance receipt number is required for partial payments",
          {
            advanceReceiptNumber: [
              "Advance receipt number is required for partial payments",
            ],
          }
        );
      }

      const payment = await tx.payment.create({
        data: {
          orgId,
          direction: input.direction as any,
          method: input.method as any,
          amount: input.amount,
          currency: input.currency || "ETB",
          relatedType: input.relatedType as any,
          relatedId: input.relatedId,
          advanceReceiptNumber: isFinalPayment ? null : advanceReceiptNumber,
          createdBy: input.createdBy,
          reviewedBy: input.reviewedBy,
          authorizedBy: input.authorizedBy,
        },
      });

      if (isFinalPayment) {
        await tx.salesInvoice.update({
          where: { id: invoice.id },
          data: {
            status: "Paid",
            invoiceType: "Cash",
            paidDate: new Date(),
            fiscalReceiptNumber,
          },
        });
      }

      return this.serializePayment(payment);
    });
  }

  async getPaymentById(orgId: string, id: string): Promise<Payment> {
    const payment = await this.paymentsRepo.findById(orgId, id);
    if (!payment) {
      throw new NotFoundError("Payment not found");
    }
    return payment;
  }

  async listPayments(orgId: string, options: ListOptions) {
    return await this.paymentsRepo.list(orgId, options);
  }

  async updatePayment(
    orgId: string,
    id: string,
    input: Partial<CreatePaymentInput>
  ): Promise<Payment> {
    const existing = await this.getPaymentById(orgId, id);
    if (
      existing.direction === "Incoming" &&
      existing.relatedType === "Invoice"
    ) {
      throw new ConflictError(
        "Invoice payments cannot be edited directly. Void or reverse the payment instead."
      );
    }

    return await this.paymentsRepo.update(orgId, id, input);
  }

  async deletePayment(orgId: string, id: string): Promise<void> {
    const existing = await this.getPaymentById(orgId, id);
    if (
      existing.direction === "Incoming" &&
      existing.relatedType === "Invoice"
    ) {
      throw new ConflictError(
        "Invoice payments cannot be deleted directly. Void or reverse the payment instead."
      );
    }

    await this.paymentsRepo.delete(orgId, id);
  }

  async getRecentPayments(orgId: string, limit: number = 5) {
    return await this.paymentsRepo.getRecentPayments(orgId, limit);
  }
}

export const paymentsService = new PaymentsService();
