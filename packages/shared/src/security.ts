/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Security middleware: helmet (HTTP security headers) and rate limiting.
 * CORS lockdown for the SSE endpoint lives with chat-service, since the
 * gateway is now the only public origin every other service ever sees.
 */

import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import type { Express } from 'express';

/** Applies baseline security middleware. Call once, on the gateway (the one public surface). */
export function applySecurityMiddleware(app: Express): void {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://*.unsplash.com"],
        connectSrc: ["'self'"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests. Please try again later.' },
  });
  app.use('/api/', globalLimiter);
}

// ── Endpoint-Specific Rate Limiters ─────────────────────────────────
export const messageLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Message rate limit exceeded. Please slow down.' },
});

export const inviteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Invitation rate limit exceeded.' },
});

export const streamLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many stream connections.' },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
});
