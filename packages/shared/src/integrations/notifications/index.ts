/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Selects and exports the configured NotificationProvider singleton.
 */

import { NoopNotificationProvider } from './noop';
import { Msg91Provider } from './msg91';
import type { NotificationProvider } from './types';

export type { NotificationProvider, OtpRequest } from './types';

function createNotificationProvider(): NotificationProvider {
  const authKey = process.env.MSG91_AUTH_KEY;
  const templateId = process.env.MSG91_TEMPLATE_ID;

  if (authKey && templateId) {
    return new Msg91Provider(authKey, templateId);
  }
  return new NoopNotificationProvider();
}

export const notificationProvider: NotificationProvider = createNotificationProvider();
