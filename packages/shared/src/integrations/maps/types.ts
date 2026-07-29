/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Provider-agnostic maps/geolocation interface.
 */

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface NearbyPlace {
  name: string;
  category: 'school' | 'hospital' | 'transit';
  distance: string;
  time: string;
  rating: number;
}

export interface MapsProvider {
  geocode(address: string): Promise<GeoPoint | null>;
  getNearbyPlaces(locality: string, category?: NearbyPlace['category']): Promise<NearbyPlace[]>;
}
