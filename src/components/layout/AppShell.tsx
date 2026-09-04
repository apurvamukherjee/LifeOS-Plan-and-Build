import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pt-6 pb-28">
      {children}
      <BottomNav />
    </div>
  )
}
