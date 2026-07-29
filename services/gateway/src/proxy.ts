/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Reverse proxy to every backend service. No auth logic lives here — each
 * service verifies its own JWT independently (see @ourhome/shared's
 * authMiddleware). This is a dumb pass-through, on purpose.
 *
 * Mounted via `app.use(createProxyMiddleware({ pathFilter, ... }))` at the
 * app level (not `app.use(prefix, middleware)`) so Express never strips the
 * `/api/<domain>` prefix before the proxy sees it — each backend service
 * mounts its own router at that exact same public prefix.
 */

import type { Express } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { logger } from '@ourhome/shared';
import type { GatewayConfig } from './config';

export function mountProxies(app: Express, config: GatewayConfig): void {
  const routes: Array<{ path: string; target: string }> = [
    { path: '/api/auth', target: config.authServiceUrl },
    { path: '/api/properties', target: config.propertiesServiceUrl },
    { path: '/api/appointments', target: config.appointmentsServiceUrl },
    { path: '/api/inquiries', target: config.inquiriesServiceUrl },
    { path: '/api/favorites', target: config.favoritesServiceUrl },
    { path: '/api/support-requests', target: config.supportServiceUrl },
  ];

  for (const route of routes) {
    app.use(createProxyMiddleware({
      pathFilter: route.path,
      target: route.target,
      changeOrigin: true,
      on: {
        error: (err, _req, res) => {
          logger.error('Proxy error', { path: route.path, target: route.target, error: String(err) });
          if ('writeHead' in res) {
            res.writeHead(502, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Upstream service unavailable.' }));
          }
        },
      },
    }));
  }

  // Chat gets its own proxy: SSE (/api/chat/stream) is a long-lived connection
  // that must never be timed out or buffered by the proxy.
  app.use(createProxyMiddleware({
    pathFilter: '/api/chat',
    target: config.chatServiceUrl,
    changeOrigin: true,
    proxyTimeout: 0,
    on: {
      error: (err, _req, res) => {
        logger.error('Proxy error', { path: '/api/chat', target: config.chatServiceUrl, error: String(err) });
        if ('writeHead' in res) {
          res.writeHead(502, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Upstream service unavailable.' }));
        }
      },
    },
  }));
}
