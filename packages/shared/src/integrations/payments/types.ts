/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Provider-agnostic payment interface. Business logic must depend on this
 * interface only, never on a vendor SDK/API directly.
 */

export interface CreateOrderInput {
  amountInPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface PaymentOrder {
  orderId: string;
  amountInPaise: number;
  currency: string;
  status: string;
}

export interface VerifyPaymentInput {
  orderId: string;
  paymentId: string;
  signature: string;
}

export interface PaymentProvider {
  createOrder(input: CreateOrderInput): Promise<PaymentOrder>;
  verifyPayment(input: VerifyPaymentInput): Promise<boolean>;
}
