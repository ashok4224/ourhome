/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * MSG91 implementation of NotificationProvider (India-focused SMS/OTP
 * gateway), talking to the REST API directly via fetch.
 */

import { logger } from '../../logger';
import type { NotificationProvider, OtpRequest } from './types';

const MSG91_API_BASE = 'https://control.msg91.com/api/v5';

export class Msg91Provider implements NotificationProvider {
  constructor(private readonly authKey: string, private readonly templateId: string) {}

  async sendSms(to: string, message: string): Promise<void> {
    const res = await fetch(`${MSG91_API_BASE}/flow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authkey: this.authKey },
      body: JSON.stringify({ mobiles: to, message }),
    });
    if (!res.ok) {
      const body = await res.text();
      logger.error('MSG91 sendSms failed', { status: res.status, body });
      throw new Error(`MSG91 sendSms failed (HTTP ${res.status})`);
    }
  }

  async sendOtp(to: string): Promise<OtpRequest> {
    const res = await fetch(`${MSG91_API_BASE}/otp?mobile=${encodeURIComponent(to)}&template_id=${this.templateId}`, {
      method: 'POST',
      headers: { authkey: this.authKey },
    });
    if (!res.ok) {
      const body = await res.text();
      logger.error('MSG91 sendOtp failed', { status: res.status, body });
      throw new Error(`MSG91 sendOtp failed (HTTP ${res.status})`);
    }
    return { requestId: to };
  }

  async verifyOtp(requestId: string, code: string): Promise<boolean> {
    const res = await fetch(`${MSG91_API_BASE}/otp/verify?mobile=${encodeURIComponent(requestId)}&otp=${encodeURIComponent(code)}`, {
      headers: { authkey: this.authKey },
    });
    if (!res.ok) return false;
    const body = await res.json() as { type: string };
    return body.type === 'success';
  }
}
