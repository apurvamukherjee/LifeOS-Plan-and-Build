/**
 * Minimal pub/sub so repositories can announce a local write without importing the
 * (much heavier, Supabase-dependent) sync engine directly. syncEngine.ts subscribes to this
 * to trigger its debounced sync cycle; until it does, notify() is a harmless no-op.
 */
type Listener = () => void

const listeners = new Set<Listener>()

export function notifyLocalWrite(): void {
  for (const listener of listeners) listener()
}

export function onLocalWrite(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
