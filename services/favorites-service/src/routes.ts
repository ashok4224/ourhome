/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Per-user saved/favorited property routes.
 */

import { Router } from 'express';
import type { z } from 'zod';
import { requireAuth, validate, FavoriteSchema } from '@ourhome/shared';
import * as favoritesService from './service';
import type { ServiceConfig } from './config';

export function createFavoritesRouter(config: ServiceConfig): Router {
  const router = Router();
  const auth = requireAuth(config.jwtSecret);

  router.get('/', auth, async (req, res) => {
    const saved = await favoritesService.listFavoriteIds(req.user!.id);
    res.json(saved);
  });

  router.post('/', auth, validate(FavoriteSchema), async (req, res) => {
    const { propertyId } = req.body as z.infer<typeof FavoriteSchema>;
    await favoritesService.addFavorite(req.user!.id, propertyId);
    res.status(201).json({ success: true });
  });

  router.delete('/:propertyId', auth, async (req, res) => {
    const { propertyId } = req.params;
    await favoritesService.removeFavorite(req.user!.id, propertyId);
    res.json({ success: true });
  });

  return router;
}
