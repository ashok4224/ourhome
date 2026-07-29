/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Razorpay implementation of PaymentProvider, talking to the REST API
 * directly (no SDK dependency) via fetch + Basic Auth.
 */

import crypto from 'crypto';
import { logger } from '../../logger';
import type { CreateOrderInput, PaymentOrder, PaymentProvider, VerifyPaymentInput } from './types';

const RAZORPAY_API_BASE = 'https://api.razorpay.com/v1';

export class RazorpayProvider implements PaymentProvider {
  constructor(private readonly keyId: string, private readonly keySecret: string) {}

  private authHeader(): string {
    return `Basic ${Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64')}`;
  }

  async createOrder(input: CreateOrderInput): Promise<PaymentOrder> {
    const res = await fetch(`${RAZORPAY_API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: this.authHeader() },
      body: JSON.stringify({
        amount: input.amountInPaise,
        currency: input.currency ?? 'INR',
        receipt: input.receipt,
        notes: input.notes,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      logger.error('Razorpay order creation failed', { status: res.status, body });
      throw new Error(`Razorpay order creation failed (HTTP ${res.status})`);
    }

    const order = await res.json() as { id: string; amount: number; currency: string; status: string };
    return {
      orderId: order.id,
      amountInPaise: order.amount,
      currency: order.currency,
      status: order.status,
    };
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<boolean> {
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(`${input.orderId}|${input.paymentId}`)
      .digest('hex');

    const expected = Buffer.from(expectedSignature);
    const actual = Buffer.from(input.signature);
    if (expected.length !== actual.length) return false;
    return crypto.timingSafeEqual(expected, actual);
  }
}
