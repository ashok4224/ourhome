/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Google Maps implementation of MapsProvider, talking to the Geocoding and
 * Places REST APIs directly via fetch (no SDK dependency).
 */

import { logger } from '../../logger';
import type { GeoPoint, MapsProvider, NearbyPlace } from './types';

const GEOCODE_API = 'https://maps.googleapis.com/maps/api/geocode/json';
const PLACES_NEARBY_API = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

const CATEGORY_TO_PLACE_TYPE: Record<NearbyPlace['category'], string> = {
  school: 'school',
  hospital: 'hospital',
  transit: 'transit_station',
};

function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371;
  const dLat = (b.lat - a.lat) * (Math.PI / 180);
  const dLng = (b.lng - a.lng) * (Math.PI / 180);
  const lat1 = a.lat * (Math.PI / 180);
  const lat2 = b.lat * (Math.PI / 180);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(h));
}

export class GoogleMapsProvider implements MapsProvider {
  constructor(private readonly apiKey: string) {}

  async geocode(address: string): Promise<GeoPoint | null> {
    const url = `${GEOCODE_API}?address=${encodeURIComponent(address)}&key=${this.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) {
      logger.error('Google Geocoding request failed', { status: res.status });
      return null;
    }
    const body = await res.json() as { results?: Array<{ geometry?: { location?: { lat: number; lng: number } } }> };
    const location = body.results?.[0]?.geometry?.location;
    return location ? { lat: location.lat, lng: location.lng } : null;
  }

  async getNearbyPlaces(locality: string, category?: NearbyPlace['category']): Promise<NearbyPlace[]> {
    const origin = await this.geocode(`${locality}, Hyderabad, India`);
    if (!origin) return [];

    const categories = category ? [category] : (Object.keys(CATEGORY_TO_PLACE_TYPE) as NearbyPlace['category'][]);
    const results: NearbyPlace[] = [];

    for (const cat of categories) {
      const url = `${PLACES_NEARBY_API}?location=${origin.lat},${origin.lng}&radius=5000&type=${CATEGORY_TO_PLACE_TYPE[cat]}&key=${this.apiKey}`;
      const res = await fetch(url);
      if (!res.ok) {
        logger.error('Google Places nearby search failed', { status: res.status, category: cat });
        continue;
      }
      const body = await res.json() as { results?: Array<{ name: string; rating?: number; geometry?: { location?: { lat: number; lng: number } } }> };
      for (const place of body.results ?? []) {
        const loc = place.geometry?.location;
        const distanceKm = loc ? haversineKm(origin, { lat: loc.lat, lng: loc.lng }) : 0;
        results.push({
          name: place.name,
          category: cat,
          distance: `${distanceKm.toFixed(1)} km`,
          time: `${Math.max(1, Math.round((distanceKm / 30) * 60))} mins drive`,
          rating: place.rating ?? 0,
        });
      }
    }

    return results;
  }
}
