/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Inquiry routes. Customers only ever see/manage their own inquiries;
 * builder/admin see all.
 */

import { Router } from 'express';
import type { z } from 'zod';
import { requireAuth, validate, CreateInquirySchema, UpdateInquiryStatusSchema, logger } from '@ourhome/shared';
import * as inquiriesService from './service';
import type { ServiceConfig } from './config';

export function createInquiriesRouter(config: ServiceConfig): Router {
  const router = Router();
  const auth = requireAuth(config.jwtSecret);

  router.get('/', auth, async (req, res) => {
    const isPrivileged = req.user!.role === 'builder' || req.user!.role === 'admin';
    const inquiries = await inquiriesService.listInquiries({ privileged: isPrivileged, userId: req.user!.id });
    res.json(inquiries);
  });

  router.post('/', auth, validate(CreateInquirySchema), async (req, res) => {
    const body = req.body as z.infer<typeof CreateInquirySchema>;
    const inquiry = await inquiriesService.createInquiry(body, req.user!.id);

    logger.info('Inquiry created', { inquiryId: inquiry.id, propertyId: body.propertyId, userId: req.user!.id });
    res.status(201).json(inquiry);
  });

  router.delete('/:id', auth, async (req, res) => {
    const { id } = req.params;
    const isPrivileged = req.user!.role === 'builder' || req.user!.role === 'admin';

    const inquiry = await inquiriesService.findInquiry(id);
    if (!inquiry) {
      res.status(404).json({ error: 'Inquiry not found.' });
      return;
    }
    if (!isPrivileged && inquiry.userId !== req.user!.id) {
      res.status(403).json({ error: 'Insufficient permissions.' });
      return;
    }

    await inquiriesService.deleteInquiry(id);
    logger.info('Inquiry withdrawn', { inquiryId: id, userId: req.user!.id });
    res.json({ success: true });
  });

  router.patch('/:id/status', auth, async (req, res) => {
    if (req.user!.role !== 'builder' && req.user!.role !== 'admin') {
      res.status(403).json({ error: 'Insufficient permissions.' });
      return;
    }
    const parsed = UpdateInquiryStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.issues });
      return;
    }

    const { id } = req.params;
    try {
      const inquiry = await inquiriesService.updateInquiryStatus(id, parsed.data.status);
      logger.info('Inquiry status updated', { inquiryId: id, status: parsed.data.status, userId: req.user!.id });
      res.json(inquiry);
    } catch {
      res.status(404).json({ error: 'Inquiry not found.' });
    }
  });

  return router;
}
