/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Real-time chat: SSE stream + REST endpoints for messages, typing, invitations.
 */

import { Router } from 'express';
import { requireAuth, messageLimiter, inviteLimiter, streamLimiter, validate, MessageSchema, TypingSchema, InviteSchema, logger } from '@ourhome/shared';
import * as chatService from './service';
import * as realtime from './realtime';
import { secureSseCors } from './sseCors';
import type { ServiceConfig } from './config';

export function createChatRouter(config: ServiceConfig): Router {
  const router = Router();
  const auth = requireAuth(config.jwtSecret);

  router.get('/stream', streamLimiter, secureSseCors, auth, async (req, res) => {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    res.write(': connected\n\n');

    const keepAlive = setInterval(() => {
      res.write(': keep-alive\n\n');
    }, 12000);

    const [recentMessages, invitations] = await Promise.all([
      chatService.getRecentMessages(),
      chatService.listInvitations(),
    ]);
    res.write(`data: ${JSON.stringify({
      type: 'sync',
      messages: recentMessages.map(chatService.toMessageDTO),
      invitations: invitations.map(chatService.toInvitationDTO),
      typingStates: realtime.getTypingStates(),
    })}\n\n`);

    realtime.addSseClient(res);
    logger.info('SSE client connected', { total: realtime.getActiveConnectionCount(), userId: req.user!.id });

    req.on('close', () => {
      clearInterval(keepAlive);
      realtime.removeSseClient(res);
      logger.info('SSE client disconnected', { total: realtime.getActiveConnectionCount() });
    });
  });

  router.get('/state', auth, async (_req, res) => {
    const [recentMessages, invitations] = await Promise.all([
      chatService.getRecentMessages(),
      chatService.listInvitations(),
    ]);
    res.json({
      messages: recentMessages.map(chatService.toMessageDTO),
      invitations: invitations.map(chatService.toInvitationDTO),
      typingStates: realtime.getTypingStates(),
    });
  });

  router.post('/message', auth, messageLimiter, validate(MessageSchema), async (req, res) => {
    const { propertyId, sender } = req.body;

    const created = await chatService.createMessage(req.body);
    const newMessage = chatService.toMessageDTO(created);

    const typingStates = realtime.setTypingState(propertyId, sender, false);

    realtime.broadcast({ type: 'msg', message: newMessage });
    realtime.broadcast({ type: 'typing_sync', typingStates });

    logger.info('Chat message sent', { messageId: newMessage.id, propertyId, sender });
    res.status(201).json(newMessage);
  });

  router.post('/typing', auth, validate(TypingSchema), (req, res) => {
    const { propertyId, role, isTyping } = req.body;
    const typingStates = realtime.setTypingState(propertyId, role, isTyping);

    realtime.broadcast({ type: 'typing_sync', typingStates });
    res.json({ success: true, typingStates });
  });

  router.post('/invite', auth, inviteLimiter, validate(InviteSchema), async (req, res) => {
    const { propertyId, propertyTitle, customerEmail } = req.body;

    const existing = await chatService.findActiveInvitation(propertyId, customerEmail);
    if (existing) {
      res.json(chatService.toInvitationDTO(existing));
      return;
    }

    const created = await chatService.createInvitation(req.body);
    const newInvite = chatService.toInvitationDTO(created);

    realtime.broadcast({ type: 'invite', invitation: newInvite });
    logger.info('Chat invitation created', { inviteId: newInvite.id, propertyId });
    res.status(201).json(newInvite);
  });

  router.post('/clear', auth, async (req, res) => {
    const messages = await chatService.clearAll();
    realtime.clearTypingStates();

    realtime.broadcast({ type: 'sync', messages: messages.map(chatService.toMessageDTO), invitations: [], typingStates: [] });
    logger.warn('Chat data cleared', { userId: req.user!.id });
    res.json({ success: true, message: 'States fully purged' });
  });

  return router;
}
