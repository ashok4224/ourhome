/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * chat-service — owns the ChatMessage/ChatInvitation models, plus the
 * real-time SSE hub (see realtime.ts for its in-process scaling limitation).
 */

import express from 'express';
import { logger, requestLogger, cookieParserMiddleware } from '@ourhome/shared';
import { loadConfig } from './config';
import { createChatRouter } from './routes';
import { ensureWelcomeMessage } from './service';
import { getActiveConnectionCount } from './realtime';

const SERVICE_NAME = 'chat-service';
const START_TIME = Date.now();

async function start(): Promise<void> {
  const config = loadConfig();
  const app = express();

  app.use(express.json({ limit: '512kb' }));
  app.use(cookieParserMiddleware);
  app.use(requestLogger);

  await ensureWelcomeMessage();

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: SERVICE_NAME,
      uptime: Math.floor((Date.now() - START_TIME) / 1000),
      activeConnections: getActiveConnectionCount(),
    });
  });

  app.use('/api/chat', createChatRouter(config));

  app.listen(config.port, () => {
    logger.info(`${SERVICE_NAME} running`, { port: config.port, environment: config.nodeEnv });
  });
}

start().catch((err) => {
  logger.error(`Fatal: ${SERVICE_NAME} failed to start`, { error: String(err) });
  process.exit(1);
});
