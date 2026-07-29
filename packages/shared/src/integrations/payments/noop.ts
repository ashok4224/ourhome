/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Default payment provider when no real gateway is configured.
 */

import { logger } from '../../logger';
import type { CreateOrderInput, PaymentOrder, PaymentProvider, VerifyPaymentInput } from './types';

export class NoopPaymentProvider implements PaymentProvider {
  async createOrder(input: CreateOrderInput): Promise<PaymentOrder> {
    logger.warn('Payments provider not configured — returning a mock order. Set RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET to use a real gateway.', { receipt: input.receipt });
    return {
      orderId: `noop_order_${Date.now()}`,
      amountInPaise: input.amountInPaise,
      currency: input.currency ?? 'INR',
      status: 'created',
    };
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<boolean> {
    logger.warn('Payments provider not configured — treating payment as verified without checking a real gateway.', { orderId: input.orderId });
    return true;
  }
}
