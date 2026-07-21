import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from 'react'
import {
  AppData,
  Category,
  EntryType,
  Goal,
  Habit,
  RecurringTask,
  RepeatMode,
  Settings,
  Subscription,
  Task,
} from './types'
import { defaultData, loadData, materializeRecurring, saveData, uid } from './db'
import { todayKey } from '../utils/dates'

interface StoreContextValue {
  data: AppData
  // tasks
  addTask: (title: string, date: string, notes?: string) => void
  toggleTask: (id: string) => void
  updateTask: (id: string, patch: Partial<Task>) => void
  deleteTask: (id: string) => void
  carryOverTasks: (from: string, to: string) => void
  // recurring tasks
  addRecurringTask: (title: string, repeat: RepeatMode) => void
  deleteRecurringTask: (id: string) => void
  // expenses & income
  addExpense: (e: {
    amount: number
    categoryId: string
    date: string
    note?: string
    type?: EntryType
  }) => void
  deleteExpense: (id: string) => void
  // subscriptions
  addSubscription: (s: Omit<Subscription, 'id' | 'createdAt' | 'active'>) => void
  updateSubscription: (id: string, patch: Partial<Subscription>) => void
  deleteSubscription: (id: string) => void
  // categories
  addCategory: (name: string, color: string) => void
  updateCategory: (id: string, patch: Partial<Category>) => void
  deleteCategory: (id: string) => void
  // habits
  addHabit: (name: string, emoji?: string) => void
  updateHabit: (id: string, patch: Partial<Habit>) => void
  deleteHabit: (id: string) => void
  toggleHabit: (habitId: string, dateKey: string) => void
  // goals
  addGoal: (g: Omit<Goal, 'id' | 'createdAt' | 'done'>) => void
  updateGoal: (id: string, patch: Partial<Goal>) => void
  deleteGoal: (id: string) => void
  // journal
  saveJournal: (date: string, mood: number, text: string, tags: string[]) => void
  deleteJournal: (id: string) => void
  // settings
  updateSettings: (patch: Partial<Settings>) => void
  // data mgmt
  replaceAll: (data: AppData) => void
  clearAll: () => void
}

const StoreContext = createContext<StoreContextValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData())
  const firstRun = useRef(true)

  // Materialize recurring tasks / due subscriptions once on load.
  useEffect(() => {
    setData((d) => materializeRecurring(d))
  }, [])

  // Persist whenever data changes (skip the very first render).
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false
      return
    }
    saveData(data)
  }, [data])

  // ---- tasks ----
  const addTask = useCallback((title: string, date: string, notes?: string) => {
    const t = title.trim()
    if (!t) return
    setData((d) => ({
      ...d,
      tasks: [
        ...d.tasks,
        { id: uid(), title: t, notes, done: false, date, createdAt: Date.now() },
      ],
    }))
  }, [])

  const toggleTask = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      tasks: d.tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    }))
  }, [])

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setData((d) => ({
      ...d,
      tasks: d.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    }))
  }, [])

  const deleteTask = useCallback((id: string) => {
    setData((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) }))
  }, [])

  const carryOverTasks = useCallback((from: string, to: string) => {
    setData((d) => ({
      ...d,
      tasks: d.tasks.map((t) =>
        t.date === from && !t.done ? { ...t, date: to } : t,
      ),
    }))
  }, [])

  const addRecurringTask = useCallback(
    (title: string, repeat: RepeatMode) => {
      const t = title.trim()
      if (!t || repeat === 'none') return
      setData((d) => {
        const rt: RecurringTask = {
          id: uid(),
          title: t,
          repeat,
          weekday: new Date().getDay(),
          createdAt: Date.now(),
        }
        return materializeRecurring({
          ...d,
          recurringTasks: [...d.recurringTasks, rt],
        })
      })
    },
    [],
  )

  const deleteRecurringTask = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      recurringTasks: d.recurringTasks.filter((r) => r.id !== id),
    }))
  }, [])

  // ---- expenses & income ----
  const addExpense = useCallback(
    (e: {
      amount: number
      categoryId: string
      date: string
      note?: string
      type?: EntryType
    }) => {
      if (!e.amount || e.amount <= 0) return
      setData((d) => ({
        ...d,
        expenses: [
          ...d.expenses,
          {
            id: uid(),
            amount: e.amount,
            categoryId: e.categoryId,
            date: e.date,
            note: e.note,
            type: e.type || 'expense',
            createdAt: Date.now(),
          },
        ],
      }))
    },
    [],
  )

  const deleteExpense = useCallback((id: string) => {
    setData((d) => ({ ...d, expenses: d.expenses.filter((x) => x.id !== id) }))
  }, [])

  // ---- subscriptions ----
  const addSubscription = useCallback(
    (s: Omit<Subscription, 'id' | 'createdAt' | 'active'>) => {
      if (!s.name.trim() || !s.amount || s.amount <= 0) return
      setData((d) =>
        materializeRecurring({
          ...d,
          subscriptions: [
            ...d.subscriptions,
            { ...s, id: uid(), active: true, createdAt: Date.now() },
          ],
        }),
      )
    },
    [],
  )

  const updateSubscription = useCallback(
    (id: string, patch: Partial<Subscription>) => {
      setData((d) => ({
        ...d,
        subscriptions: d.subscriptions.map((s) =>
          s.id === id ? { ...s, ...patch } : s,
        ),
      }))
    },
    [],
  )

  const deleteSubscription = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      subscriptions: d.subscriptions.filter((s) => s.id !== id),
    }))
  }, [])

  // ---- categories ----
  const addCategory = useCallback((name: string, color: string) => {
    const n = name.trim()
    if (!n) return
    setData((d) => ({
      ...d,
      categories: [
        ...d.categories,
        { id: uid(), name: n, color, monthlyBudget: 0 },
      ],
    }))
  }, [])

  const updateCategory = useCallback((id: string, patch: Partial<Category>) => {
    setData((d) => ({
      ...d,
      categories: d.categories.map((c) =>
        c.id === id ? { ...c, ...patch } : c,
      ),
    }))
  }, [])

  const deleteCategory = useCallback((id: string) => {
    setData((d) => ({
      ...d,
      categories: d.categories.filter((c) => c.id !== id),
      expenses: d.expenses.map((e) =>
        e.categoryId === id ? { ...e, categoryId: 'other' } : e,
      ),
    }))
  }, [])

  // ---- habits ----
  const addHabit = useCallback((name: string, emoji?: string) => {
    const n = name.trim()
    if (!n) return
    setData((d) => ({
      ...d,
      habits: [...d.habits, { id: uid(), name: n, emoji, createdAt: Date.now() }],
    }))
  }, [])

  const updateHabit = useCallback((id: string, patch: Partial<Habit>) => {
    setData((d) => ({
      ...d,
      habits: d.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
    }))
  }, [])

  const deleteHabit = useCallback((id: string) => {
    setData((d) => {
      const logs = { ...d.habitLogs }
      delete logs[id]
      return { ...d, habits: d.habits.filter((h) => h.id !== id), habitLogs: logs }
    })
  }, [])

  const toggleHabit = useCallback((habitId: string, dateKey: string) => {
    setData((d) => {
      const forHabit = { ...(d.habitLogs[habitId] || {}) }
      if (forHabit[dateKey]) delete forHabit[dateKey]
      else forHabit[dateKey] = true
      return { ...d, habitLogs: { ...d.habitLogs, [habitId]: forHabit } }
    })
  }, [])

  // ---- goals ----
  const addGoal = useCallback((g: Omit<Goal, 'id' | 'createdAt' | 'done'>) => {
    setData((d) => ({
      ...d,
      goals: [
        ...d.goals,
        { ...g, id: uid(), createdAt: Date.now(), done: false },
      ],
    }))
  }, [])

  const updateGoal = useCallback((id: string, patch: Partial<Goal>) => {
    setData((d) => ({
      ...d,
      goals: d.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)),
    }))
  }, [])

  const deleteGoal = useCallback((id: string) => {
    setData((d) => ({ ...d, goals: d.goals.filter((g) => g.id !== id) }))
  }, [])

  // ---- journal ----
  const saveJournal = useCallback(
    (date: string, mood: number, text: string, tags: string[]) => {
      setData((d) => {
        const existing = d.journal.find((j) => j.date === date)
        if (existing) {
          return {
            ...d,
            journal: d.journal.map((j) =>
              j.date === date ? { ...j, mood, text, tags } : j,
            ),
          }
        }
        return {
          ...d,
          journal: [
            ...d.journal,
            { id: uid(), date, mood, text, tags, createdAt: Date.now() },
          ],
        }
      })
    },
    [],
  )

  const deleteJournal = useCallback((id: string) => {
    setData((d) => ({ ...d, journal: d.journal.filter((j) => j.id !== id) }))
  }, [])

  // ---- settings & data mgmt ----
  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }))
  }, [])

  const replaceAll = useCallback((incoming: AppData) => {
    setData(materializeRecurring(incoming))
  }, [])

  const clearAll = useCallback(() => {
    setData({ ...defaultData(), settings: { ...defaultData().settings } })
  }, [])

  const value = useMemo<StoreContextValue>(
    () => ({
      data,
      addTask,
      toggleTask,
      updateTask,
      deleteTask,
      carryOverTasks,
      addRecurringTask,
      deleteRecurringTask,
      addExpense,
      deleteExpense,
      addSubscription,
      updateSubscription,
      deleteSubscription,
      addCategory,
      updateCategory,
      deleteCategory,
      addHabit,
      updateHabit,
      deleteHabit,
      toggleHabit,
      addGoal,
      updateGoal,
      deleteGoal,
      saveJournal,
      deleteJournal,
      updateSettings,
      replaceAll,
      clearAll,
    }),
    [
      data,
      addTask,
      toggleTask,
      updateTask,
      deleteTask,
      carryOverTasks,
      addRecurringTask,
      deleteRecurringTask,
      addExpense,
      deleteExpense,
      addSubscription,
      updateSubscription,
      deleteSubscription,
      addCategory,
      updateCategory,
      deleteCategory,
      addHabit,
      updateHabit,
      deleteHabit,
      toggleHabit,
      addGoal,
      updateGoal,
      deleteGoal,
      saveJournal,
      deleteJournal,
      updateSettings,
      replaceAll,
      clearAll,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

// Apply the theme preference to the document root.
export function useApplyTheme(theme: Settings['theme']) {
  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && media.matches)
      root.setAttribute('data-theme', dark ? 'dark' : 'light')
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) meta.setAttribute('content', dark ? '#0f1115' : '#6366f1')
    }
    apply()
    if (theme === 'system') {
      media.addEventListener('change', apply)
      return () => media.removeEventListener('change', apply)
    }
  }, [theme])
}

export { todayKey }
