/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * The one real cross-service call in this migration: properties-service
 * needs each property's inquiry count, which lives in inquiries-service's
 * database. Batched (one call for N property ids, not N calls), and
 * degrades to 0 rather than failing the whole properties request if
 * inquiries-service is unreachable.
 */

import { logger, internalTokenHeaders } from '@ourhome/shared';
import type { ServiceConfig } from './config';

/** Returns a map of propertyId -> inquiry count. Missing ids default to 0. */
export async function getInquiryCounts(propertyIds: string[], config: ServiceConfig): Promise<Record<string, number>> {
  if (propertyIds.length === 0) return {};

  try {
    const url = `${config.inquiriesServiceUrl}/internal/inquiry-counts?propertyIds=${propertyIds.map(encodeURIComponent).join(',')}`;
    const res = await fetch(url, { headers: internalTokenHeaders(config.internalServiceToken) });

    if (!res.ok) {
      logger.warn('inquiries-service returned a non-OK response for inquiry counts; defaulting to 0', { status: res.status });
      return {};
    }

    return (await res.json()) as Record<string, number>;
  } catch (err) {
    logger.warn('inquiries-service unreachable; defaulting inquiry counts to 0', { error: String(err) });
    return {};
  }
}
