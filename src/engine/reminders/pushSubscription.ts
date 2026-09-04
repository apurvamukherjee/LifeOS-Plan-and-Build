import { db } from '@/db'
import { insertRecord } from '@/db/repositories/baseRepo'
import type { PushSubscriptionRecord } from '@/db/schema'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)))
}

/**
 * Captures and stores a push subscription — client-side scaffolding only. No-ops when
 * VITE_VAPID_PUBLIC_KEY is unset, since no server exists yet to actually send pushes (see
 * docs/ARCHITECTURE.md, "Reminder service"). This exists so a Stage 2 server piece can plug in
 * without a client rework, not to promise working push notifications today.
 */
export async function subscribeToPush(): Promise<PushSubscriptionRecord | null> {
  const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
  if (!vapidKey) return null
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null

  const registration = await navigator.serviceWorker.ready
  const existing = await registration.pushManager.getSubscription()
  const subscription =
    existing ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
    }))

  const json = subscription.toJSON()
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return null

  return insertRecord<PushSubscriptionRecord>(db.pushSubscriptions, {
    endpoint: json.endpoint,
    keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
    userAgent: navigator.userAgent,
  })
}
