import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Icon, IconName } from './Icon'

interface NavItem {
  to: string
  label: string
  icon: IconName
  tab?: boolean // shown in the mobile bottom bar
}

const ITEMS: NavItem[] = [
  { to: '/', label: 'Home', icon: 'home', tab: true },
  { to: '/tasks', label: 'Tasks', icon: 'tasks', tab: true },
  { to: '/expenses', label: 'Money', icon: 'money', tab: true },
  { to: '/habits', label: 'Habits', icon: 'habits', tab: true },
  { to: '/goals', label: 'Goals', icon: 'goals', tab: true },
  { to: '/journal', label: 'Journal', icon: 'journal', tab: true },
  { to: '/insights', label: 'Insights', icon: 'insights' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
]

export function Sidebar() {
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null)

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!installPrompt) return
    await (installPrompt as Event & { prompt: () => Promise<void> }).prompt()
    setInstallPrompt(null)
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-reactor" aria-hidden="true"><i /></span>
        <div>
          <span>Momentum</span>
          <small>PERSONAL OS</small>
        </div>
      </div>
      {ITEMS.filter((it) => it.to !== '/settings').map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.to === '/'}
          className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
        >
          <span className="ico"><Icon name={it.icon} /></span>
          {it.label}
        </NavLink>
      ))}
      <div style={{ flex: 1 }} />
      <div className="system-card">
        <span className="system-dot" />
        <div>
          <strong>Systems online</strong>
          <small>Local · Offline ready</small>
        </div>
      </div>
      {installPrompt && (
        <button className="install-btn" onClick={install}>
          <Icon name="download" size={17} />
          Install app
        </button>
      )}
      <NavLink
        to="/settings"
        className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
      >
        <span className="ico"><Icon name="settings" /></span>
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
          <span className="ico"><Icon name={it.icon} size={21} /></span>
          {it.label}
        </NavLink>
      ))}
    </nav>
  )
}
