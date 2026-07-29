/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Aggregate health check: pings every backend service's own /health and
 * rolls the results up. Replaces the old single-process health check.
 */

import type { Request, Response } from 'express';
import type { GatewayConfig } from './config';

const HEALTH_CHECK_TIMEOUT_MS = 3000;

function pingService(name: string, baseUrl: string): Promise<{ name: string; status: 'ok' | 'unreachable' }> {
  return fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS) })
    .then((res) => ({ name, status: (res.ok ? 'ok' : 'unreachable') as 'ok' | 'unreachable' }))
    .catch(() => ({ name, status: 'unreachable' as const }));
}

export function createHealthHandler(config: GatewayConfig) {
  const targets: Array<{ name: string; baseUrl: string }> = [
    { name: 'auth', baseUrl: config.authServiceUrl },
    { name: 'properties', baseUrl: config.propertiesServiceUrl },
    { name: 'appointments', baseUrl: config.appointmentsServiceUrl },
    { name: 'inquiries', baseUrl: config.inquiriesServiceUrl },
    { name: 'favorites', baseUrl: config.favoritesServiceUrl },
    { name: 'support', baseUrl: config.supportServiceUrl },
    { name: 'chat', baseUrl: config.chatServiceUrl },
  ];

  return async (_req: Request, res: Response) => {
    const results = await Promise.all(targets.map((t) => pingService(t.name, t.baseUrl)));
    const services = Object.fromEntries(results.map((r) => [r.name, r.status]));
    const allOk = results.every((r) => r.status === 'ok');

    res.json({
      status: allOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      services,
    });
  };
}
