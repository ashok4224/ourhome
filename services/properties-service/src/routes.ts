/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Property CRUD + status-transition routes.
 */

import { Router } from 'express';
import type { z } from 'zod';
import { requireAuth, requireRole, validate, CreatePropertySchema, logger } from '@ourhome/shared';
import * as propertiesService from './service';
import { toPropertyDTO } from './dto';
import { getInquiryCounts } from './inquiriesClient';
import type { ServiceConfig } from './config';

export function createPropertiesRouter(config: ServiceConfig): Router {
  const router = Router();
  const auth = requireAuth(config.jwtSecret);

  router.get('/', auth, async (_req, res) => {
    const properties = await propertiesService.listProperties();
    const counts = await getInquiryCounts(properties.map((p) => p.id), config);
    res.json(properties.map((p) => toPropertyDTO(p, counts[p.id] ?? 0)));
  });

  router.post('/', auth, requireRole('builder'), validate(CreatePropertySchema), async (req, res) => {
    const body = req.body as z.infer<typeof CreatePropertySchema>;
    const property = await propertiesService.createProperty(body);

    logger.info('Property created', { propertyId: property.id, userId: req.user!.id });
    res.status(201).json(toPropertyDTO(property, 0));
  });

  router.delete('/:id', auth, requireRole('builder'), async (req, res) => {
    const { id } = req.params;
    try {
      await propertiesService.deleteProperty(id);
    } catch {
      res.status(404).json({ error: 'Property not found.' });
      return;
    }
    logger.info('Property deleted', { propertyId: id, userId: req.user!.id });
    res.json({ success: true });
  });

  router.post('/:id/view', auth, async (req, res) => {
    const { id } = req.params;
    try {
      const property = await propertiesService.recordView(id);
      const counts = await getInquiryCounts([id], config);
      res.json(toPropertyDTO(property, counts[id] ?? 0));
    } catch {
      res.status(404).json({ error: 'Property not found.' });
    }
  });

  router.post('/:id/approve', auth, requireRole('admin'), async (req, res) => {
    const { id } = req.params;
    try {
      const property = await propertiesService.approveProperty(id);
      const counts = await getInquiryCounts([id], config);
      logger.info('Property approved', { propertyId: id, userId: req.user!.id });
      res.json(toPropertyDTO(property, counts[id] ?? 0));
    } catch {
      res.status(404).json({ error: 'Property not found.' });
    }
  });

  router.post('/:id/reject', auth, requireRole('admin'), async (req, res) => {
    const { id } = req.params;
    try {
      const property = await propertiesService.rejectProperty(id);
      const counts = await getInquiryCounts([id], config);
      logger.info('Property rejected', { propertyId: id, userId: req.user!.id });
      res.json(toPropertyDTO(property, counts[id] ?? 0));
    } catch {
      res.status(404).json({ error: 'Property not found.' });
    }
  });

  return router;
}
