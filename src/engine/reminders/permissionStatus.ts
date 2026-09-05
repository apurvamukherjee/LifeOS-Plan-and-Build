import type { PermissionState } from '@capacitor/core'

export interface NativeReminderHealth {
  hasIssue: boolean
  notificationDenied: boolean
  exactAlarmDenied: boolean
}

/**
 * Pure decision logic for whether a user needs to be nudged back to Android Settings — kept
 * separate from nativeNotifications.ts's actual plugin calls so it's testable without mocking
 * Capacitor. 'prompt'/'prompt-with-rationale' aren't treated as an issue: the normal
 * requestPermissions() flow still has a chance to succeed there, unlike 'denied'.
 */
export function evaluateReminderHealth(
  notification: PermissionState,
  exactAlarm: PermissionState,
): NativeReminderHealth {
  const notificationDenied = notification === 'denied'
  const exactAlarmDenied = exactAlarm === 'denied'
  return {
    hasIssue: notificationDenied || exactAlarmDenied,
    notificationDenied,
    exactAlarmDenied,
  }
}
