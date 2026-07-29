/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Zod validation schemas for all API request bodies, shared across services.
 */

import { z } from 'zod';

// ── Chat Message Schema ──────────────────────────────────────────────
export const MessageSchema = z.object({
  propertyId: z.string().min(1).max(50).trim(),
  sender: z.enum(['customer', 'builder']),
  senderName: z.string().min(1).max(100).trim(),
  text: z.string().max(5000).default(''),
  attachment: z.object({
    name: z.string().max(200).trim(),
    type: z.enum(['image', 'document']),
    url: z.string().url().max(2000),
  }).optional(),
});

// ── Typing Indicator Schema ──────────────────────────────────────────
export const TypingSchema = z.object({
  propertyId: z.string().min(1).max(50).trim(),
  role: z.enum(['customer', 'builder']),
  isTyping: z.boolean(),
});

// ── Chat Invitation Schema ───────────────────────────────────────────
export const InviteSchema = z.object({
  propertyId: z.string().min(1).max(50).trim(),
  propertyTitle: z.string().min(1).max(200).trim(),
  customerName: z.string().min(1).max(100).trim(),
  customerEmail: z.string().email().max(200).trim().optional().default('anonymous@ourhome.com'),
});

// ── Auth Login Schema ────────────────────────────────────────────────
export const LoginSchema = z.object({
  email: z.string().email().max(200).trim(),
  password: z.string().min(6).max(128),
});

// ── Property Schemas ─────────────────────────────────────────────────
export const PropertyStatusEnum = z.enum(['Approved', 'Pending Approval', 'Rented', 'Sold', 'Draft', 'Rejected']);

export const CreatePropertySchema = z.object({
  title: z.string().min(1).max(200).trim(),
  location: z.string().min(1).max(300).trim(),
  subLocality: z.string().min(1).max(100).trim(),
  price: z.number().int().positive(),
  rentOrBuy: z.enum(['Rent', 'Buy']),
  sizeSqFt: z.number().int().positive(),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  facing: z.string().min(1).max(50).trim(),
  amenities: z.array(z.string().max(100)).max(50).default([]),
  description: z.string().min(1).max(10000),
  images: z.array(z.string().url().max(2000)).max(30).default([]),
  agent: z.object({
    name: z.string().min(1).max(100).trim(),
    phone: z.string().min(1).max(30).trim(),
    email: z.string().email().max(200).trim(),
    avatar: z.string().url().max(2000),
  }),
  featured: z.boolean().optional().default(false),
  tags: z.array(z.string().max(50)).max(20).optional().default([]),
});

// ── Appointment Schema ───────────────────────────────────────────────
export const CreateAppointmentSchema = z.object({
  propertyId: z.string().min(1).max(50).trim(),
  propertyTitle: z.string().min(1).max(200).trim(),
  customerName: z.string().min(1).max(100).trim(),
  customerEmail: z.string().email().max(200).trim(),
  customerPhone: z.string().min(1).max(30).trim(),
  date: z.string().min(1).max(30).trim(),
  timeSlot: z.string().min(1).max(50).trim(),
});

// ── Inquiry Schemas ──────────────────────────────────────────────────
export const InquiryStatusEnum = z.enum(['Received', 'Under Review', 'Contacted', 'Answered']);

export const CreateInquirySchema = z.object({
  propertyId: z.string().min(1).max(50).trim(),
  propertyTitle: z.string().min(1).max(200).trim(),
  customerName: z.string().min(1).max(100).trim(),
  customerEmail: z.string().email().max(200).trim(),
  customerPhone: z.string().min(1).max(30).trim(),
  message: z.string().min(1).max(5000),
});

export const UpdateInquiryStatusSchema = z.object({
  status: InquiryStatusEnum,
});

// ── Favorites Schema ─────────────────────────────────────────────────
export const FavoriteSchema = z.object({
  propertyId: z.string().min(1).max(50).trim(),
});

// ── Express middleware factory ───────────────────────────────────────
import type { Request, Response, NextFunction } from 'express';

/**
 * Creates an Express middleware that validates req.body against a Zod schema.
 * On failure, returns 400 with structured error details.
 */
export function validate<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
      return;
    }
    // Replace body with parsed (sanitized/trimmed) data
    req.body = result.data;
    next();
  };
}
