import clsx from 'clsx'
import { NavLink } from 'react-router-dom'

const TABS = [
  { to: '/', label: 'Home', icon: '🏠', end: true },
  { to: '/water', label: 'Water', icon: '💧', end: false },
  { to: '/supplements', label: 'Supplements', icon: '💊', end: false },
  { to: '/tasks', label: 'Tasks', icon: '✅', end: false },
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
          <span className="text-lg leading-none">{tab.icon}</span>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
