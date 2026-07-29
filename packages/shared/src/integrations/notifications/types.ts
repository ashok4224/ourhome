/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Provider-agnostic SMS/OTP interface.
 */

export interface OtpRequest {
  requestId: string;
}

export interface NotificationProvider {
  sendSms(to: string, message: string): Promise<void>;
  sendOtp(to: string): Promise<OtpRequest>;
  verifyOtp(requestId: string, code: string): Promise<boolean>;
}
