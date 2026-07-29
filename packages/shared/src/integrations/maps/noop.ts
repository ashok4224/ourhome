/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Default maps provider when no real geolocation gateway is configured.
 *
 * Note: the frontend's NearbyInfrastructureModal still renders from its own
 * static dataset (src/data/nearbyData.ts) directly — that's app UI data, not
 * something this shared backend package should reach into. This noop exists
 * so any future service that calls mapsProvider doesn't need a real API key
 * in dev; it deliberately returns nothing rather than faking results.
 */

import { logger } from '../../logger';
import type { GeoPoint, MapsProvider, NearbyPlace } from './types';

export class NoopMapsProvider implements MapsProvider {
  async geocode(address: string): Promise<GeoPoint | null> {
    logger.warn('Maps provider not configured — cannot geocode. Set GOOGLE_MAPS_API_KEY to use a real provider.', { address });
    return null;
  }

  async getNearbyPlaces(locality: string, category?: NearbyPlace['category']): Promise<NearbyPlace[]> {
    logger.warn('Maps provider not configured — returning no nearby places. Set GOOGLE_MAPS_API_KEY to use a real provider.', { locality, category });
    return [];
  }
}
