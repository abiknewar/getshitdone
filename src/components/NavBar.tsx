import { NavLink } from 'react-router-dom'
import { BriefIcon, ChartIcon, ListIcon, SunIcon } from './icons'

const tabs = [
  { to: '/', label: 'Today', Icon: SunIcon, end: true },
  { to: '/all', label: 'All', Icon: ListIcon, end: false },
  { to: '/brief', label: 'Brief', Icon: BriefIcon, end: false },
  { to: '/insights', label: 'Insights', Icon: ChartIcon, end: false },
]

export function NavBar() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex max-w-md items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {tabs.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              'flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] transition-colors ' +
              (isActive ? 'font-semibold text-ink' : 'text-faint hover:text-ink')
            }
          >
            <Icon className="h-[22px] w-[22px]" />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
