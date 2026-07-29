/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { optionalEnv } from '@ourhome/shared';

export interface GatewayConfig {
  port: number;
  nodeEnv: string;
  authServiceUrl: string;
  propertiesServiceUrl: string;
  appointmentsServiceUrl: string;
  inquiriesServiceUrl: string;
  favoritesServiceUrl: string;
  supportServiceUrl: string;
  chatServiceUrl: string;
}

export function loadConfig(): GatewayConfig {
  return {
    port: parseInt(optionalEnv('PORT', '3000'), 10),
    nodeEnv: optionalEnv('NODE_ENV', 'development'),
    authServiceUrl: optionalEnv('AUTH_SERVICE_URL', 'http://localhost:4001'),
    propertiesServiceUrl: optionalEnv('PROPERTIES_SERVICE_URL', 'http://localhost:4002'),
    appointmentsServiceUrl: optionalEnv('APPOINTMENTS_SERVICE_URL', 'http://localhost:4003'),
    inquiriesServiceUrl: optionalEnv('INQUIRIES_SERVICE_URL', 'http://localhost:4004'),
    favoritesServiceUrl: optionalEnv('FAVORITES_SERVICE_URL', 'http://localhost:4005'),
    supportServiceUrl: optionalEnv('SUPPORT_SERVICE_URL', 'http://localhost:4006'),
    chatServiceUrl: optionalEnv('CHAT_SERVICE_URL', 'http://localhost:4007'),
  };
}
