/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * JWT sign/verify shared by every service. auth-service is the only one that
 * signs tokens; every other service only ever verifies them (see
 * authMiddleware.ts) — none of them need to know how a token was produced.
 */

import jwt from 'jsonwebtoken';

/** Name of the httpOnly cookie carrying the JWT. Set by auth-service, read by everyone. */
export const AUTH_COOKIE_NAME = 'ourhome.jwt';

export interface AuthTokenPayload {
  sub: string; // user id
  role: 'customer' | 'builder' | 'admin';
  name: string;
  email: string;
}

const JWT_EXPIRY = '24h'; // matches the previous session cookie's maxAge

export function signAuthToken(payload: AuthTokenPayload, secret: string): string {
  return jwt.sign(payload, secret, { expiresIn: JWT_EXPIRY });
}

export function verifyAuthToken(token: string, secret: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, secret) as AuthTokenPayload;
  } catch {
    return null;
  }
}
