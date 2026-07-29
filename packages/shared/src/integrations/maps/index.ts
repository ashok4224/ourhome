/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Selects and exports the configured MapsProvider singleton.
 */

import { NoopMapsProvider } from './noop';
import { GoogleMapsProvider } from './googleMaps';
import type { MapsProvider } from './types';

export type { MapsProvider, GeoPoint, NearbyPlace } from './types';

function createMapsProvider(): MapsProvider {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (apiKey) {
    return new GoogleMapsProvider(apiKey);
  }
  return new NoopMapsProvider();
}

export const mapsProvider: MapsProvider = createMapsProvider();
