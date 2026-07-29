/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * In-process real-time state for chat: connected SSE clients and live typing
 * indicators. Both live in memory, per-process only. Now that chat runs as
 * its own service, this is the concrete thing that breaks the moment
 * chat-service runs more than one replica — a broadcast from one instance
 * never reaches a client connected to another. Not fixed in this pass (no
 * Redis added); see ARCHITECTURE.md for the plan when that's needed.
 */

import type express from 'express';
import { logger } from '@ourhome/shared';

export interface TypingState {
  propertyId: string;
  role: 'customer' | 'builder';
  isTyping: boolean;
}

let typingStates: TypingState[] = [];
let sseClients: express.Response[] = [];

export function getTypingStates(): TypingState[] {
  return typingStates;
}

export function setTypingState(propertyId: string, role: TypingState['role'], isTyping: boolean): TypingState[] {
  typingStates = typingStates.filter((t) => !(t.propertyId === propertyId && t.role === role));
  if (isTyping) {
    typingStates.push({ propertyId, role, isTyping: true });
  }
  return typingStates;
}

export function clearTypingStates(): void {
  typingStates = [];
}

export function addSseClient(res: express.Response): void {
  sseClients.push(res);
}

export function removeSseClient(res: express.Response): void {
  sseClients = sseClients.filter((client) => client !== res);
}

export function getActiveConnectionCount(): number {
  return sseClients.length;
}

export function broadcast(payload: unknown): void {
  const data = JSON.stringify(payload, (_key, value) => (typeof value === 'bigint' ? Number(value) : value));
  sseClients.forEach((client) => {
    try {
      client.write(`data: ${data}\n\n`);
    } catch (err) {
      logger.error('Error broadcasting to SSE client', { error: String(err) });
    }
  });
}
