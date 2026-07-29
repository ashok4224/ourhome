/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Admin support-ticket routes.
 */

import { Router } from 'express';
import { requireAuth, requireRole, logger } from '@ourhome/shared';
import * as supportService from './service';
import type { ServiceConfig } from './config';

export function createSupportRouter(config: ServiceConfig): Router {
  const router = Router();
  const auth = requireAuth(config.jwtSecret);

  router.get('/', auth, requireRole('admin'), async (_req, res) => {
    const requests = await supportService.listSupportRequests();
    res.json(requests);
  });

  router.post('/:id/resolve', auth, requireRole('admin'), async (req, res) => {
    const { id } = req.params;
    try {
      const request = await supportService.resolveSupportRequest(id);
      logger.info('Support ticket resolved', { supportRequestId: id, userId: req.user!.id });
      res.json(request);
    } catch {
      res.status(404).json({ error: 'Support request not found.' });
    }
  });

  return router;
}
