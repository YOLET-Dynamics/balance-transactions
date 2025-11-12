import { paymentsRepository } from "@/infrastructure/repositories/payments.repository.impl";
import type {
  Payment,
  PaymentDirection,
  RelatedType,
  ListOptions,
} from "@/domain/repositories/payments.repository";
import { NotFoundError } from "@/lib/utils/errors";

interface CreatePaymentInput {
  direction: PaymentDirection;
  method: string;
  amount: number;
  currency?: string;
  relatedType: RelatedType;
  relatedId?: string;
  createdBy?: string;
  reviewedBy?: string;
  authorizedBy?: string;
}

class PaymentsService {
  private paymentsRepo = paymentsRepository;

  async createPayment(
    orgId: string,
    input: CreatePaymentInput
  ): Promise<Payment> {
    const paymentData = {
      direction: input.direction,
      method: input.method,
      amount: input.amount,
      currency: input.currency || "ETB",
      relatedType: input.relatedType,
      relatedId: input.relatedId || null,
      createdBy: input.createdBy,
      reviewedBy: input.reviewedBy,
      authorizedBy: input.authorizedBy,
    };

    return await this.paymentsRepo.create(orgId, paymentData);
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
    return await this.paymentsRepo.update(orgId, id, input);
  }

  async deletePayment(orgId: string, id: string): Promise<void> {
    await this.paymentsRepo.delete(orgId, id);
  }

  async getRecentPayments(orgId: string, limit: number = 5) {
    return await this.paymentsRepo.getRecentPayments(orgId, limit);
  }
}

export const paymentsService = new PaymentsService();

