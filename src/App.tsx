import { Routes, Route } from 'react-router-dom'
import { Sidebar, TabBar } from './components/Nav'
import { QuickAdd } from './components/QuickAdd'
import { useApplyTheme, useStore } from './store/StoreContext'
import { useReminder } from './utils/reminder'
import { Dashboard } from './pages/Dashboard'
import { Tasks } from './pages/Tasks'
import { Expenses } from './pages/Expenses'
import { Habits } from './pages/Habits'
import { Goals } from './pages/Goals'
import { Journal } from './pages/Journal'
import { Insights } from './pages/Insights'
import { Settings } from './pages/Settings'

export function App() {
  const { data } = useStore()
  useApplyTheme(data.settings.theme)
  useReminder(data)

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/habits" element={<Habits />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
      <QuickAdd />
      <TabBar />
    </div>
  )
}
