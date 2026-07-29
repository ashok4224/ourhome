/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Auth routes: login / logout / current-session lookup.
 */

import { Router } from 'express';
import {
  validate, LoginSchema, authLimiter,
  signAuthToken, AUTH_COOKIE_NAME, requireAuth,
} from '@ourhome/shared';
import { verifyLogin, getUserById } from './service';
import type { ServiceConfig } from './config';

export function createAuthRouter(config: ServiceConfig): Router {
  const router = Router();
  const guard = requireAuth(config.jwtSecret);

  router.post('/login', authLimiter, validate(LoginSchema), async (req, res) => {
    const { email, password } = req.body;

    const user = await verifyLogin(email, password);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = signAuthToken({ sub: user.id, role: user.role, name: user.name, email: user.email }, config.jwtSecret);
    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ user });
  });

  router.post('/logout', (_req, res) => {
    res.clearCookie(AUTH_COOKIE_NAME);
    res.json({ success: true });
  });

  router.get('/me', guard, async (req, res) => {
    const user = await getUserById(req.user!.id);
    if (!user) {
      res.status(401).json({ error: 'User not found.' });
      return;
    }
    res.json({ user });
  });

  return router;
}
