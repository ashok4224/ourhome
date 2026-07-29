/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Property/Appointment/Inquiry/SupportRequest seed data now lives in prisma/seed.ts
 * and is loaded from the API — see the data-fetch effect in src/App.tsx. What's left
 * here are generic localStorage helpers, still used for the (deliberately unmigrated,
 * purely cosmetic) event-log telemetry feed.
 */

// LocalStorage helpers
export const loadData = <T>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error reading localStorage key ' + key, e);
  }
  return defaultValue;
};

export const saveData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error writing localStorage key ' + key, e);
  }
};
