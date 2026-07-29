/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Favorites business logic: the only place in this service allowed to touch
 * `prisma.savedProperty`.
 */

import { prisma } from '@ourhome/shared';

export async function listFavoriteIds(userId: string): Promise<string[]> {
  const saved = await prisma.savedProperty.findMany({ where: { userId }, select: { propertyId: true } });
  return saved.map((s) => s.propertyId);
}

export function addFavorite(userId: string, propertyId: string) {
  return prisma.savedProperty.upsert({
    where: { userId_propertyId: { userId, propertyId } },
    update: {},
    create: { userId, propertyId },
  });
}

export function removeFavorite(userId: string, propertyId: string) {
  return prisma.savedProperty.deleteMany({ where: { userId, propertyId } });
}
