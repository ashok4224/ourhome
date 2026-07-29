/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Guards service-to-service internal endpoints (e.g.
 * inquiries-service's /internal/inquiry-counts) with a shared-secret header,
 * so they can't be hit directly from the public internet through the
 * gateway's proxy paths. Not a substitute for real network isolation
 * (k8s NetworkPolicies / a service mesh) — a minimal safeguard for now.
 */

import type { Request, Response, NextFunction } from 'express';

const INTERNAL_TOKEN_HEADER = 'x-internal-token';

export function requireInternalToken(sharedSecret: string) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.header(INTERNAL_TOKEN_HEADER) !== sharedSecret) {
      res.status(403).json({ error: 'Forbidden.' });
      return;
    }
    next();
  };
}

export function internalTokenHeaders(sharedSecret: string): Record<string, string> {
  return { [INTERNAL_TOKEN_HEADER]: sharedSecret };
}
