/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared Prisma client singleton. Every service imports this, but by
 * convention only queries the Prisma models it owns — see ARCHITECTURE.md.
 */

import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();
