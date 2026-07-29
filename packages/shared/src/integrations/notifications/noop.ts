/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Default notification provider when no real SMS/OTP gateway is configured.
 * Logs instead of sending, and keeps OTP codes in memory — dev/test only.
 */

import crypto from 'crypto';
import { logger } from '../../logger';
import type { NotificationProvider, OtpRequest } from './types';

const pendingOtps = new Map<string, string>();

export class NoopNotificationProvider implements NotificationProvider {
  async sendSms(to: string, message: string): Promise<void> {
    logger.warn('Notifications provider not configured — SMS not actually sent.', { to, message });
  }

  async sendOtp(to: string): Promise<OtpRequest> {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const requestId = crypto.randomUUID();
    pendingOtps.set(requestId, code);
    logger.warn('Notifications provider not configured — OTP not actually sent, logging instead. Set MSG91_AUTH_KEY to use a real gateway.', { to, requestId, code });
    return { requestId };
  }

  async verifyOtp(requestId: string, code: string): Promise<boolean> {
    const expected = pendingOtps.get(requestId);
    if (!expected) return false;
    const isValid = expected === code;
    if (isValid) pendingOtps.delete(requestId);
    return isValid;
  }
}
