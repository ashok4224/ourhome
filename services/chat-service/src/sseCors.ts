/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * CORS lockdown for the SSE endpoint. Belt-and-suspenders: the gateway is
 * the only public origin any browser ever talks to, but this keeps
 * chat-service from being usable cross-origin even if it were ever exposed
 * directly.
 */

import type { Request, Response, NextFunction } from 'express';

export function secureSseCors(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;
  const appUrl = process.env.APP_URL;

  if (!origin || (appUrl && origin === appUrl)) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  }
  next();
}
