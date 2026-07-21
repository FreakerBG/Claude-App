// Core data types for Momentum. All data is stored locally per-device.

export type ThemePref = 'light' | 'dark' | 'system'

export interface Task {
  id: string
  title: string
  notes?: string
  done: boolean
  date: string // YYYY-MM-DD (the day the task belongs to)
  createdAt: number
}

export interface Expense {
  id: string
  amount: number
  categoryId: string
  note?: string
  date: string // YYYY-MM-DD
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
}

export interface Settings {
  name: string
  currency: string // ISO code, e.g. USD, EUR, BGN
  theme: ThemePref
}

export interface AppData {
  tasks: Task[]
  expenses: Expense[]
  categories: Category[]
  habits: Habit[]
  habitLogs: HabitLogs
  goals: Goal[]
  journal: JournalEntry[]
  settings: Settings
  meta: { schemaVersion: number }
}

export const SCHEMA_VERSION = 1
