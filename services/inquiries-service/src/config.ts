/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { requireEnv, optionalEnv } from '@ourhome/shared';

export interface ServiceConfig {
  port: number;
  jwtSecret: string;
  nodeEnv: string;
  internalServiceToken: string;
}

export function loadConfig(): ServiceConfig {
  return {
    port: parseInt(optionalEnv('PORT', '4004'), 10),
    jwtSecret: requireEnv('JWT_SECRET'),
    nodeEnv: optionalEnv('NODE_ENV', 'development'),
    internalServiceToken: requireEnv('INTERNAL_SERVICE_TOKEN'),
  };
}
