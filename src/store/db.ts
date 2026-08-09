import { AppData, Category, SCHEMA_VERSION, YtFamily } from './types'
import { uid } from '../utils/id'
import { monthKey, parseKey, todayKey } from '../utils/dates'

const STORAGE_KEY = 'momentum:data'

export function defaultYtFamily(): YtFamily {
  return {
    members: [
      { id: 'dalgia', name: 'Дългия', initials: 'Д' },
      { id: 'ivan', name: 'Иван', initials: 'И' },
      { id: 'denis', name: 'Денис', initials: 'Де' },
      { id: 'antonio', name: 'Антонио', initials: 'А' },
    ],
    price: 3,
    symbol: '€',
    years: [2026, 2027],
    paid: {},
  }
}

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Drink', color: '#ef4444', monthlyBudget: 0 },
  { id: 'transport', name: 'Transport', color: '#f59e0b', monthlyBudget: 0 },
  { id: 'bills', name: 'Bills', color: '#3b82f6', monthlyBudget: 0 },
  { id: 'fun', name: 'Fun', color: '#8b5cf6', monthlyBudget: 0 },
  { id: 'health', name: 'Health', color: '#10b981', monthlyBudget: 0 },
  { id: 'other', name: 'Other', color: '#6b7280', monthlyBudget: 0 },
]

export function defaultData(): AppData {
  return {
    tasks: [],
    recurringTasks: [],
    expenses: [],
    subscriptions: [],
    categories: DEFAULT_CATEGORIES.map((c) => ({ ...c })),
    habits: [],
    habitLogs: {},
    goals: [],
    journal: [],
    ytFamily: defaultYtFamily(),
    settings: { name: '', currency: 'EUR', theme: 'dark' },
    meta: { schemaVersion: SCHEMA_VERSION },
  }
}

// Merge loaded data over defaults so new fields always exist (also migrates
// older backups, which simply lack the newer arrays/fields).
function normalize(raw: unknown): AppData {
  const base = defaultData()
  if (!raw || typeof raw !== 'object') return base
  const r = raw as Partial<AppData>
  return {
    tasks: Array.isArray(r.tasks) ? r.tasks : base.tasks,
    recurringTasks: Array.isArray(r.recurringTasks)
      ? r.recurringTasks
      : base.recurringTasks,
    expenses: Array.isArray(r.expenses) ? r.expenses : base.expenses,
    subscriptions: Array.isArray(r.subscriptions)
      ? r.subscriptions
      : base.subscriptions,
    categories:
      Array.isArray(r.categories) && r.categories.length
        ? r.categories
        : base.categories,
    habits: Array.isArray(r.habits) ? r.habits : base.habits,
    habitLogs:
      r.habitLogs && typeof r.habitLogs === 'object'
        ? r.habitLogs
        : base.habitLogs,
    goals: Array.isArray(r.goals) ? r.goals : base.goals,
    journal: Array.isArray(r.journal) ? r.journal : base.journal,
    ytFamily:
      r.ytFamily && Array.isArray(r.ytFamily.members)
        ? { ...base.ytFamily, ...r.ytFamily }
        : base.ytFamily,
    settings: { ...base.settings, ...(r.settings || {}) },
    meta: {
      schemaVersion: SCHEMA_VERSION,
      lastMaterialized: r.meta?.lastMaterialized,
    },
  }
}

export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultData()
    return normalize(JSON.parse(raw))
  } catch {
    return defaultData()
  }
}

export function saveData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    // Storage full or unavailable — surface once.
    console.error('Could not save data', e)
  }
}

// ---- Backup: export & import ----
export function exportData(data: AppData): void {
  const payload = JSON.stringify({ ...data, exportedAt: Date.now() }, null, 2)
  const blob = new Blob([payload], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `momentum-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export async function importData(file: File): Promise<AppData> {
  const text = await file.text()
  const parsed = JSON.parse(text)
  return normalize(parsed)
}

// Materialize today's recurring tasks and any due subscriptions into real
// entries. Idempotent — safe to run on every app load.
export function materializeRecurring(data: AppData): AppData {
  const today = todayKey()
  const dow = parseKey(today).getDay()
  const curMonth = monthKey(today)
  const curDay = parseKey(today).getDate()
  let changed = false

  const tasks = [...data.tasks]
  for (const rt of data.recurringTasks) {
    const matches =
      rt.repeat === 'daily' ||
      (rt.repeat === 'weekdays' && dow >= 1 && dow <= 5) ||
      (rt.repeat === 'weekly' &&
        dow === (rt.weekday ?? new Date(rt.createdAt).getDay()))
    if (!matches) continue
    if (tasks.some((t) => t.repeatId === rt.id && t.date === today)) continue
    tasks.push({
      id: uid(),
      title: rt.title,
      done: false,
      date: today,
      createdAt: Date.now(),
      repeatId: rt.id,
    })
    changed = true
  }

  const expenses = [...data.expenses]
  for (const sub of data.subscriptions) {
    if (!sub.active || curDay < sub.dayOfMonth) continue
    if (
      expenses.some(
        (e) => e.subscriptionId === sub.id && monthKey(e.date) === curMonth,
      )
    )
      continue
    const day = String(Math.min(sub.dayOfMonth, 28)).padStart(2, '0')
    expenses.push({
      id: uid(),
      amount: sub.amount,
      categoryId: sub.categoryId,
      date: `${curMonth}-${day}`,
      note: sub.name,
      createdAt: Date.now(),
      subscriptionId: sub.id,
      type: 'expense',
    })
    changed = true
  }

  if (!changed && data.meta.lastMaterialized === today) return data
  return {
    ...data,
    tasks,
    expenses,
    meta: { ...data.meta, lastMaterialized: today },
  }
}

export { STORAGE_KEY, uid }
