/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * gateway — the only public entry point. Serves the frontend and reverse
 * proxies /api/* to each backend service. No auth logic and no body
 * parsing here on purpose: parsing the body here would drain the request
 * stream before http-proxy-middleware can forward it untouched to the
 * target service, which parses it itself.
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { logger, requestLogger, applySecurityMiddleware } from '@ourhome/shared';
import { loadConfig } from './config';
import { mountProxies } from './proxy';
import { createHealthHandler } from './health';

const SERVICE_NAME = 'gateway';

async function start(): Promise<void> {
  const config = loadConfig();
  const app = express();

  app.use(requestLogger);

  if (config.nodeEnv === 'production') {
    applySecurityMiddleware(app);
  }

  app.get('/api/health', createHealthHandler(config));

  mountProxies(app, config);

  // ── Frontend ────────────────────────────────────────────────────
  // Always run relative to the repo root (this process's cwd is set to the
  // repo root by both the Dockerfile's WORKDIR and the root dev script —
  // never `npm run dev --workspace=...`, which would change cwd to this
  // service's own directory and break both of these paths).
  if (config.nodeEnv !== 'production') {
    const vite = await createViteServer({
      root: process.cwd(),
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(config.port, '0.0.0.0', () => {
    logger.info(`${SERVICE_NAME} running`, { url: `http://0.0.0.0:${config.port}`, environment: config.nodeEnv });
  });
}

start().catch((err) => {
  logger.error(`Fatal: ${SERVICE_NAME} failed to start`, { error: String(err) });
  process.exit(1);
});
