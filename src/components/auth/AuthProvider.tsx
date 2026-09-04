import { isSupabaseConfigured, supabase } from '@/engine/sync/supabaseClient'
import { triggerSyncNow } from '@/engine/sync/syncEngine'
import type { Session } from '@supabase/supabase-js'
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'

interface AuthContextValue {
  isConfigured: boolean
  session: Session | null
  loading: boolean
  signInWithPassword: (email: string, password: string) => Promise<string | null>
  signUpWithPassword: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      if (newSession) triggerSyncNow()
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  async function signInWithPassword(email: string, password: string): Promise<string | null> {
    if (!supabase) return 'Supabase is not configured.'
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return error?.message ?? null
  }

  async function signUpWithPassword(email: string, password: string): Promise<string | null> {
    if (!supabase) return 'Supabase is not configured.'
    const { error } = await supabase.auth.signUp({ email, password })
    return error?.message ?? null
  }

  async function signOut(): Promise<void> {
    await supabase?.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        isConfigured: isSupabaseConfigured,
        session,
        loading,
        signInWithPassword,
        signUpWithPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
