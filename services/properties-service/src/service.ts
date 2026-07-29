/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Property business logic: the only place in this service allowed to touch
 * `prisma.property`.
 */

import type { z } from 'zod';
import { prisma, type CreatePropertySchema } from '@ourhome/shared';

export function listProperties() {
  return prisma.property.findMany({ orderBy: { createdAt: 'desc' } });
}

export function createProperty(body: z.infer<typeof CreatePropertySchema>) {
  return prisma.property.create({
    data: {
      title: body.title,
      location: body.location,
      subLocality: body.subLocality,
      price: body.price,
      rentOrBuy: body.rentOrBuy,
      sizeSqFt: body.sizeSqFt,
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
      facing: body.facing,
      status: 'Approved',
      amenities: body.amenities,
      description: body.description,
      images: body.images,
      agentName: body.agent.name,
      agentPhone: body.agent.phone,
      agentEmail: body.agent.email,
      agentAvatar: body.agent.avatar,
      featured: body.featured,
      tags: body.tags,
    },
  });
}

export function deleteProperty(id: string) {
  return prisma.property.delete({ where: { id } });
}

export function recordView(id: string) {
  return prisma.property.update({ where: { id }, data: { views: { increment: 1 } } });
}

export function approveProperty(id: string) {
  return prisma.property.update({ where: { id }, data: { status: 'Approved' } });
}

export function rejectProperty(id: string) {
  return prisma.property.update({ where: { id }, data: { status: 'Rejected' } });
}
