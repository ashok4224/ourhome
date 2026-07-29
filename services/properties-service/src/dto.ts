/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Property as PropertyRow } from '@prisma/client';

/**
 * `inquiryCount` used to come from a Prisma relation `include` straight into
 * the Inquiry table — impossible now that properties and inquiries are
 * separate services. It's fetched over HTTP from inquiries-service and
 * passed in here instead. See inquiriesClient.ts.
 */
export function toPropertyDTO(property: PropertyRow, inquiryCount: number) {
  return {
    id: property.id,
    title: property.title,
    location: property.location,
    subLocality: property.subLocality,
    price: property.price,
    rentOrBuy: property.rentOrBuy,
    sizeSqFt: property.sizeSqFt,
    bedrooms: property.bedrooms,
    bathrooms: property.bathrooms,
    facing: property.facing,
    status: property.status,
    amenities: property.amenities,
    description: property.description,
    images: property.images,
    agent: {
      name: property.agentName,
      phone: property.agentPhone,
      email: property.agentEmail,
      avatar: property.agentAvatar,
    },
    views: property.views,
    inquiries: inquiryCount,
    featured: property.featured,
    tags: property.tags,
  };
}
