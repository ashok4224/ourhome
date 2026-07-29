/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Chat business logic: the only place in this service allowed to touch
 * `prisma.chatMessage` / `prisma.chatInvitation`.
 */

import type { z } from 'zod';
import { prisma, type MessageSchema, type InviteSchema } from '@ourhome/shared';

const DEFAULT_MESSAGE = {
  id: 'm1',
  propertyId: 'prop-1',
  sender: 'builder' as const,
  senderName: 'Arjun Nandan',
  text: 'Hello! Welcome to the premium listing of Gachibowli Sky Penthouse. How may I assist your custom queries today?',
  timestamp: BigInt(Date.now() - 36500000),
};

/** Ensures the demo welcome chat message exists (idempotent). Call once at boot. */
export function ensureWelcomeMessage() {
  return prisma.chatMessage.upsert({ where: { id: DEFAULT_MESSAGE.id }, update: {}, create: DEFAULT_MESSAGE });
}

// ── DTO mappers (BigInt timestamps aren't JSON-serializable as-is) ────
export function toMessageDTO(row: {
  id: string; propertyId: string; sender: string; senderName: string; text: string; timestamp: bigint;
  attachmentName: string | null; attachmentType: string | null; attachmentUrl: string | null;
}) {
  return {
    id: row.id,
    propertyId: row.propertyId,
    sender: row.sender,
    senderName: row.senderName,
    text: row.text,
    timestamp: Number(row.timestamp),
    attachment: row.attachmentName && row.attachmentType && row.attachmentUrl
      ? { name: row.attachmentName, type: row.attachmentType, url: row.attachmentUrl }
      : undefined,
  };
}

export function toInvitationDTO(row: {
  id: string; propertyId: string; propertyTitle: string; customerName: string; customerEmail: string; timestamp: bigint; active: boolean;
}) {
  return { ...row, timestamp: Number(row.timestamp) };
}

/** Last 100 chat messages in chronological order. */
export async function getRecentMessages() {
  const rows = await prisma.chatMessage.findMany({ orderBy: { timestamp: 'desc' }, take: 100 });
  return rows.reverse();
}

export function listInvitations() {
  return prisma.chatInvitation.findMany();
}

export function createMessage(body: z.infer<typeof MessageSchema>) {
  return prisma.chatMessage.create({
    data: {
      propertyId: body.propertyId,
      sender: body.sender,
      senderName: body.senderName,
      text: body.text || '',
      timestamp: BigInt(Date.now()),
      attachmentName: body.attachment?.name,
      attachmentType: body.attachment?.type,
      attachmentUrl: body.attachment?.url,
    },
  });
}

export function findActiveInvitation(propertyId: string, customerEmail: string) {
  return prisma.chatInvitation.findFirst({
    where: { propertyId, customerEmail: customerEmail || 'anonymous@ourhome.com', active: true },
  });
}

export function createInvitation(body: z.infer<typeof InviteSchema>) {
  return prisma.chatInvitation.create({
    data: {
      propertyId: body.propertyId,
      propertyTitle: body.propertyTitle,
      customerName: body.customerName,
      customerEmail: body.customerEmail || 'anonymous@ourhome.com',
      timestamp: BigInt(Date.now()),
      active: true,
    },
  });
}

export async function clearAll() {
  await prisma.chatMessage.deleteMany({});
  await prisma.chatInvitation.deleteMany({});
  await prisma.chatMessage.create({ data: DEFAULT_MESSAGE });
  return prisma.chatMessage.findMany();
}
