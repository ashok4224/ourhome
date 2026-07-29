/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Support-ticket business logic: the only place in this service allowed to
 * touch `prisma.supportRequest`.
 */

import { prisma } from '@ourhome/shared';

export function listSupportRequests() {
  return prisma.supportRequest.findMany({ orderBy: { createdAt: 'desc' } });
}

export function resolveSupportRequest(id: string) {
  return prisma.supportRequest.update({ where: { id }, data: { status: 'Resolved' } });
}
