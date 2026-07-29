/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { requireEnv, optionalEnv } from '@ourhome/shared';

export interface ServiceConfig {
  port: number;
  jwtSecret: string;
  nodeEnv: string;
  inquiriesServiceUrl: string;
  internalServiceToken: string;
}

export function loadConfig(): ServiceConfig {
  return {
    port: parseInt(optionalEnv('PORT', '4002'), 10),
    jwtSecret: requireEnv('JWT_SECRET'),
    nodeEnv: optionalEnv('NODE_ENV', 'development'),
    inquiriesServiceUrl: optionalEnv('INQUIRIES_SERVICE_URL', 'http://localhost:4004'),
    internalServiceToken: requireEnv('INTERNAL_SERVICE_TOKEN'),
  };
}
