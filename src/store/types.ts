// Core data types for Momentum. All data is stored locally per-device.

export type ThemePref = 'light' | 'dark' | 'system'

export type RepeatMode = 'none' | 'daily' | 'weekdays' | 'weekly'

export interface Task {
  id: string
  title: string
  notes?: string
  done: boolean
  date: string // YYYY-MM-DD (the day the task belongs to)
  createdAt: number
  repeatId?: string // set when generated from a recurring task template
}

// A recurring task template that materializes a Task instance on matching days.
export interface RecurringTask {
  id: string
  title: string
  repeat: RepeatMode // 'daily' | 'weekdays' | 'weekly'
  weekday?: number // 0-6 for 'weekly' (defaults to creation weekday)
  createdAt: number
}

export type EntryType = 'expense' | 'income'

export interface Expense {
  id: string
  amount: number
  categoryId: string
  note?: string
  date: string // YYYY-MM-DD
  createdAt: number
  type?: EntryType // undefined === 'expense' (back-compat)
  subscriptionId?: string // set when auto-added from a subscription
}

// A recurring monthly bill / subscription.
export interface Subscription {
  id: string
  name: string
  amount: number
  categoryId: string
  dayOfMonth: number // 1-28
  active: boolean
  createdAt: number
}

export interface Category {
  id: string
  name: string
  color: string
  monthlyBudget?: number
}

export interface Habit {
  id: string
  name: string
  emoji?: string
  createdAt: number
}

// habitLogs[habitId][YYYY-MM-DD] === true when done that day
export type HabitLogs = Record<string, Record<string, boolean>>

export interface Goal {
  id: string
  title: string
  currentValue: number
  targetValue: number
  unit: string
  targetDate?: string // YYYY-MM-DD
  done: boolean
  createdAt: number
}

export interface JournalEntry {
  id: string
  date: string // YYYY-MM-DD (one entry per day, editable)
  mood: number // 1..5
  text: string
  createdAt: number
  tags?: string[] // activity tags, e.g. ['work', 'exercise']
}

export interface Settings {
  name: string
  currency: string // ISO code, e.g. USD, EUR, BGN
  theme: ThemePref
  reminderEnabled?: boolean
  reminderTime?: string // HH:MM (24h)
}

export interface AppData {
  tasks: Task[]
  recurringTasks: RecurringTask[]
  expenses: Expense[]
  subscriptions: Subscription[]
  categories: Category[]
  habits: Habit[]
  habitLogs: HabitLogs
  goals: Goal[]
  journal: JournalEntry[]
  settings: Settings
  meta: { schemaVersion: number; lastMaterialized?: string }
}

export const SCHEMA_VERSION = 2

// Activity tags offered on journal entries (also power Insights correlations).
export const ACTIVITY_TAGS: { id: string; label: string; emoji: string }[] = [
  { id: 'work', label: 'Work', emoji: '💼' },
  { id: 'exercise', label: 'Exercise', emoji: '🏃' },
  { id: 'social', label: 'Social', emoji: '👥' },
  { id: 'family', label: 'Family', emoji: '👨‍👩‍👧' },
  { id: 'rest', label: 'Rest', emoji: '🛋️' },
  { id: 'outdoors', label: 'Outdoors', emoji: '🌳' },
  { id: 'reading', label: 'Reading', emoji: '📖' },
  { id: 'good-sleep', label: 'Good sleep', emoji: '😴' },
  { id: 'eat-well', label: 'Ate well', emoji: '🥗' },
  { id: 'creative', label: 'Creative', emoji: '🎨' },
]
