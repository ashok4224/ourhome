/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Inquiry business logic: the only place in this service allowed to touch
 * `prisma.inquiry`.
 */

import type { z } from 'zod';
import { prisma, type InquiryStatusEnum } from '@ourhome/shared';
import type { CreateInquirySchema } from '@ourhome/shared';

export function listInquiries(opts: { privileged: boolean; userId?: string }) {
  return prisma.inquiry.findMany({
    where: opts.privileged ? {} : { userId: opts.userId },
    orderBy: { createdAt: 'desc' },
  });
}

export function createInquiry(body: z.infer<typeof CreateInquirySchema>, userId: string | undefined) {
  return prisma.inquiry.create({
    data: {
      ...body,
      date: new Date().toISOString().slice(0, 10),
      userId: userId ?? null,
    },
  });
}

export function findInquiry(id: string) {
  return prisma.inquiry.findUnique({ where: { id } });
}

export function deleteInquiry(id: string) {
  return prisma.inquiry.delete({ where: { id } });
}

export function updateInquiryStatus(id: string, status: z.infer<typeof InquiryStatusEnum>) {
  return prisma.inquiry.update({ where: { id }, data: { status } });
}

/** Backs the internal /internal/inquiry-counts endpoint that properties-service calls. */
export async function countByPropertyIds(propertyIds: string[]): Promise<Record<string, number>> {
  const rows = await prisma.inquiry.groupBy({
    by: ['propertyId'],
    where: { propertyId: { in: propertyIds } },
    _count: { _all: true },
  });

  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.propertyId] = row._count._all;
  }
  return counts;
}
