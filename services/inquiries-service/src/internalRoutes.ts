/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Service-to-service endpoints — not reachable through the public gateway
 * paths, guarded by a shared internal token instead of a user JWT. Called by
 * properties-service (see its inquiriesClient.ts).
 */

import { Router } from 'express';
import { requireInternalToken } from '@ourhome/shared';
import * as inquiriesService from './service';
import type { ServiceConfig } from './config';

export function createInternalRouter(config: ServiceConfig): Router {
  const router = Router();
  router.use(requireInternalToken(config.internalServiceToken));

  router.get('/inquiry-counts', async (req, res) => {
    const raw = String(req.query.propertyIds ?? '');
    const propertyIds = raw.split(',').map((id) => id.trim()).filter(Boolean);
    const counts = await inquiriesService.countByPropertyIds(propertyIds);
    res.json(counts);
  });

  return router;
}
