/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { requireEnv, optionalEnv } from '@ourhome/shared';

export interface ServiceConfig {
  port: number;
  jwtSecret: string;
  nodeEnv: string;
}

export function loadConfig(): ServiceConfig {
  return {
    port: parseInt(optionalEnv('PORT', '4005'), 10),
    jwtSecret: requireEnv('JWT_SECRET'),
    nodeEnv: optionalEnv('NODE_ENV', 'development'),
  };
}
