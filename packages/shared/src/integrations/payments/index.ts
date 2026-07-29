/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Selects and exports the configured PaymentProvider singleton.
 */

import { NoopPaymentProvider } from './noop';
import { RazorpayProvider } from './razorpay';
import type { PaymentProvider } from './types';

export type { PaymentProvider, CreateOrderInput, PaymentOrder, VerifyPaymentInput } from './types';

function createPaymentProvider(): PaymentProvider {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (keyId && keySecret) {
    return new RazorpayProvider(keyId, keySecret);
  }
  return new NoopPaymentProvider();
}

export const paymentProvider: PaymentProvider = createPaymentProvider();
