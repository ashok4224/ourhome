/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Appointment business logic: the only place in this service allowed to
 * touch `prisma.appointment`.
 */

import type { z } from 'zod';
import { prisma, type CreateAppointmentSchema } from '@ourhome/shared';

export function listAppointments() {
  return prisma.appointment.findMany({ orderBy: { createdAt: 'desc' } });
}

export function createAppointment(body: z.infer<typeof CreateAppointmentSchema>, userId: string | undefined) {
  return prisma.appointment.create({
    data: {
      ...body,
      userId: userId ?? null,
    },
  });
}
