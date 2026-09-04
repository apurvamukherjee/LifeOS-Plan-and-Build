import { Button } from '@/components/ui/Button'
import { type FormEvent, useState } from 'react'
import { useAuth } from './AuthProvider'

export function SignInScreen({ onSkip }: { onSkip: () => void }) {
  const { signInWithPassword, signUpWithPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    const errorMessage =
      mode === 'sign-in'
        ? await signInWithPassword(email, password)
        : await signUpWithPassword(email, password)
    setSubmitting(false)
    if (errorMessage) setError(errorMessage)
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold">LifeOS</h1>
      <p className="text-sm text-(--color-text-secondary)">
        Sign in to sync your data across devices, or continue without an account — everything
        works locally either way.
      </p>
      <form onSubmit={handleSubmit} className="glass flex flex-col gap-3 rounded-3xl p-5">
        <input
          className="glass rounded-xl px-3 py-2 text-sm text-(--color-text-primary) focus:outline-none"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          className="glass rounded-xl px-3 py-2 text-sm text-(--color-text-primary) focus:outline-none"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
        />
        {error && <span className="text-xs text-action">{error}</span>}
        <Button type="submit" variant="primary" disabled={submitting}>
          {mode === 'sign-in' ? 'Sign in' : 'Create account'}
        </Button>
        <button
          type="button"
          onClick={() => setMode((prev) => (prev === 'sign-in' ? 'sign-up' : 'sign-in'))}
          className="text-xs text-(--color-text-muted) underline"
        >
          {mode === 'sign-in' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
        </button>
      </form>
      <button
        type="button"
        onClick={onSkip}
        className="text-sm text-(--color-text-secondary) underline"
      >
        Continue without an account
      </button>
    </div>
  )
}
