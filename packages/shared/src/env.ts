/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Small helpers so every service's own config.ts fails fast with a clear
 * message instead of crashing later on `undefined`.
 */

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`[Config Error] ${name} is required. Set it in the environment.`);
  }
  return value;
}

export function optionalEnv(name: string, fallback: string): string {
  return process.env[name] || fallback;
}
