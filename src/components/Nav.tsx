import { NavLink } from 'react-router-dom'

interface NavItem {
  to: string
  label: string
  icon: string
  tab?: boolean // shown in the mobile bottom bar
}

const ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: '🏠', tab: true },
  { to: '/tasks', label: 'Tasks', icon: '✅', tab: true },
  { to: '/expenses', label: 'Money', icon: '💸', tab: true },
  { to: '/habits', label: 'Habits', icon: '🔥', tab: true },
  { to: '/goals', label: 'Goals', icon: '🎯', tab: true },
  { to: '/journal', label: 'Journal', icon: '📓', tab: true },
  { to: '/insights', label: 'Insights', icon: '📊' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
]

const base = import.meta.env.BASE_URL

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <img src={`${base}icons/icon-192.png`} alt="" />
        <span>Momentum</span>
      </div>
      {ITEMS.filter((it) => it.to !== '/settings').map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.to === '/'}
          className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
        >
          <span className="ico">{it.icon}</span>
          {it.label}
        </NavLink>
      ))}
      <div style={{ flex: 1 }} />
      <NavLink
        to="/settings"
        className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
      >
        <span className="ico">⚙️</span>
        Settings
      </NavLink>
    </aside>
  )
}

export function TabBar() {
  return (
    <nav className="tabbar">
      {ITEMS.filter((i) => i.tab).map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.to === '/'}
          className={({ isActive }) => (isActive ? 'active' : '')}
        >
          <span className="ico">{it.icon}</span>
          {it.label}
        </NavLink>
      ))}
    </nav>
  )
}
