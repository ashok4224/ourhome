/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Auth guard middleware, used by every service. Each service verifies the
 * JWT independently (stateless) — there is no shared session store to check
 * against.
 */

import cookieParser from 'cookie-parser';
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { AUTH_COOKIE_NAME, verifyAuthToken, type AuthTokenPayload } from './jwt';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; role: AuthTokenPayload['role']; name: string; email: string };
    }
  }
}

/** Mount once per service, before any route that uses requireAuth. */
export const cookieParserMiddleware: RequestHandler = cookieParser();

export function requireAuth(jwtSecret: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies?.[AUTH_COOKIE_NAME];
    const payload = token ? verifyAuthToken(token, jwtSecret) : null;

    if (!payload) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    req.user = { id: payload.sub, role: payload.role, name: payload.name, email: payload.email };
    next();
  };
}

/** Must be used AFTER requireAuth. */
export function requireRole(...roles: Array<AuthTokenPayload['role']>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ error: 'Insufficient permissions.' });
      return;
    }
    next();
  };
}
