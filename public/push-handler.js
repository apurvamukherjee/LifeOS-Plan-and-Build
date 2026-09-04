// Stub push-event handler. No server exists yet to send pushes (see docs/ARCHITECTURE.md,
// "Reminder service") — this only wires up the client so a Stage 2 server piece (e.g. a
// Supabase Edge Function) can start sending real push payloads without a client-side rework.
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'LifeOS', body: 'You have a reminder.' }
  event.waitUntil(
    self.registration.showNotification(data.title || 'LifeOS', {
      body: data.body || '',
      tag: data.tag,
    }),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(self.clients.openWindow('/'))
})
