/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Site-visit appointment routes.
 */

import { Router } from 'express';
import type { z } from 'zod';
import { requireAuth, validate, CreateAppointmentSchema, logger } from '@ourhome/shared';
import * as appointmentsService from './service';
import type { ServiceConfig } from './config';

export function createAppointmentsRouter(config: ServiceConfig): Router {
  const router = Router();
  const auth = requireAuth(config.jwtSecret);

  router.get('/', auth, async (_req, res) => {
    const appointments = await appointmentsService.listAppointments();
    res.json(appointments);
  });

  router.post('/', auth, validate(CreateAppointmentSchema), async (req, res) => {
    const body = req.body as z.infer<typeof CreateAppointmentSchema>;
    const appointment = await appointmentsService.createAppointment(body, req.user!.id);

    logger.info('Appointment booked', { appointmentId: appointment.id, propertyId: body.propertyId, userId: req.user!.id });
    res.status(201).json(appointment);
  });

  return router;
}
