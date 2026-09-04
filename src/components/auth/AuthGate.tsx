import { type ReactNode, useState } from 'react'
import { useAuth } from './AuthProvider'
import { SignInScreen } from './SignInScreen'

/**
 * When Supabase isn't configured at all, this renders children unconditionally — local-only
 * mode never shows a sign-in gate. When it is configured, an unauthenticated user sees a
 * sign-in screen with a "continue without an account" skip that still leaves the app fully
 * usable (unsynced) for the rest of this session, per docs/ARCHITECTURE.md.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { isConfigured, session, loading } = useAuth()
  const [skipped, setSkipped] = useState(false)

  if (!isConfigured) return <>{children}</>
  if (loading) return null
  if (!session && !skipped) return <SignInScreen onSkip={() => setSkipped(true)} />

  return <>{children}</>
}
