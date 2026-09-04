import { AuthGate } from '@/components/auth/AuthGate'
import { AppShell } from '@/components/layout/AppShell'
import { CelebrationOverlay } from '@/components/ui/CelebrationOverlay'
import { useAppForegroundEffects } from '@/hooks/useAppForegroundEffects'
import { useSyncEngine } from '@/hooks/useSyncEngine'
import { AppRoutes } from './router'

export default function App() {
  useAppForegroundEffects()
  useSyncEngine()

  return (
    <AuthGate>
      <AppShell>
        <AppRoutes />
      </AppShell>
      <CelebrationOverlay />
    </AuthGate>
  )
}
