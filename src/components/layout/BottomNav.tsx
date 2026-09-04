import clsx from 'clsx'
import { CheckSquare, Droplet, Home, Pill, type LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'

interface Tab {
  to: string
  label: string
  icon: LucideIcon
  end: boolean
}

const TABS: Tab[] = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/water', label: 'Water', icon: Droplet, end: false },
  { to: '/supplements', label: 'Supplements', icon: Pill, end: false },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare, end: false },
]

export function BottomNav() {
  return (
    <nav className="glass fixed inset-x-4 bottom-4 z-20 mx-auto flex max-w-md justify-around rounded-full px-2 py-2">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            clsx(
              'flex flex-col items-center gap-0.5 rounded-full px-4 py-1.5 text-xs',
              isActive ? 'text-action' : 'text-(--color-text-secondary)',
            )
          }
        >
          <tab.icon size={20} strokeWidth={2} />
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
