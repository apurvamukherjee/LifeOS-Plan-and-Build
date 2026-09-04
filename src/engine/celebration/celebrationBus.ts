/**
 * Minimal pub/sub (same pattern as engine/sync/syncBus.ts) so any action function can trigger a
 * goal-completion celebration without importing the UI layer directly. A single
 * <CelebrationOverlay/> mounted near the app root subscribes and renders the actual animation.
 */
type Listener = () => void

const listeners = new Set<Listener>()

export function triggerCelebration(): void {
  for (const listener of listeners) listener()
}

export function onCelebration(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
