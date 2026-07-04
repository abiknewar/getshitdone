import { NavLink } from 'react-router-dom'
import { ChartIcon, ListIcon, SunIcon } from './icons'

const tabs = [
  { to: '/', label: 'Today', Icon: SunIcon, end: true },
  { to: '/all', label: 'All', Icon: ListIcon, end: false },
  { to: '/insights', label: 'Insights', Icon: ChartIcon, end: false },
]

export function NavBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              'flex flex-1 flex-col items-center gap-1 py-2.5 text-xs transition-colors ' +
              (isActive ? 'text-brand-soft' : 'text-muted hover:text-text')
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
