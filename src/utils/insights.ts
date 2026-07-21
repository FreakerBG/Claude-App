import { ACTIVITY_TAGS, AppData } from '../store/types'
import { addMonths, lastNDays, monthKey } from './dates'

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

// Spending total per month for the last N months (income excluded).
export function spendTrend(
  data: AppData,
  months: number,
  endMonth: string,
): { label: string; value: number }[] {
  const out: { label: string; value: number }[] = []
  for (let i = months - 1; i >= 0; i--) {
    const mk = addMonths(endMonth, -i)
    const total = data.expenses
      .filter((e) => e.type !== 'income' && monthKey(e.date) === mk)
      .reduce((s, e) => s + e.amount, 0)
    out.push({ label: MONTHS_SHORT[Number(mk.slice(5, 7)) - 1], value: total })
  }
  return out
}

// Map of dateKey -> mood (1..5).
export function moodByDate(data: AppData): Record<string, number> {
  const m: Record<string, number> = {}
  for (const j of data.journal) m[j.date] = j.mood
  return m
}

export function moodTrend(
  data: AppData,
  days: number,
): { label: string; value: number }[] {
  const byDate = moodByDate(data)
  return lastNDays(days).map((d) => ({
    label: d.slice(8),
    value: byDate[d] || 0,
  }))
}

// Habit completion rate over the last N days (share of habit-days ticked).
export function habitStats(
  data: AppData,
  days: number,
): { rate: number; perHabit: { name: string; emoji?: string; rate: number }[] } {
  const window = lastNDays(days)
  let done = 0
  let possible = 0
  const perHabit = data.habits.map((h) => {
    const log = data.habitLogs[h.id] || {}
    const created = new Date(h.createdAt)
    const hitDays = window.filter((d) => {
      // only count days on/after the habit was created
      return new Date(d + 'T23:59:59') >= created
    })
    const hDone = hitDays.filter((d) => log[d]).length
    done += hDone
    possible += hitDays.length
    return {
      name: h.name,
      emoji: h.emoji,
      rate: hitDays.length ? hDone / hitDays.length : 0,
    }
  })
  return { rate: possible ? done / possible : 0, perHabit }
}

export interface Correlation {
  label: string
  emoji: string
  on: number // avg mood on days with the factor
  off: number // avg mood on days without
  delta: number
  sample: number // min sample size across the two groups
}

// For journaled days, compare average mood with vs without each factor.
export function moodCorrelations(data: AppData): Correlation[] {
  const entries = data.journal
  if (entries.length < 4) return []

  const avg = (xs: number[]) =>
    xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0

  const build = (
    label: string,
    emoji: string,
    predicate: (date: string, tags: string[]) => boolean,
  ): Correlation | null => {
    const on: number[] = []
    const off: number[] = []
    for (const j of entries) {
      if (predicate(j.date, j.tags || [])) on.push(j.mood)
      else off.push(j.mood)
    }
    if (on.length < 2 || off.length < 2) return null
    return {
      label,
      emoji,
      on: avg(on),
      off: avg(off),
      delta: avg(on) - avg(off),
      sample: Math.min(on.length, off.length),
    }
  }

  const results: Correlation[] = []

  // Habit factor: days with at least one habit ticked.
  const habitDays = new Set<string>()
  for (const log of Object.values(data.habitLogs))
    for (const [d, v] of Object.entries(log)) if (v) habitDays.add(d)
  const habitCorr = build('you kept your habits', '🔥', (d) => habitDays.has(d))
  if (habitCorr) results.push(habitCorr)

  // Activity tags.
  for (const tag of ACTIVITY_TAGS) {
    const c = build(tag.label.toLowerCase(), tag.emoji, (_d, tags) =>
      tags.includes(tag.id),
    )
    if (c) results.push(c)
  }

  // Strongest absolute effects first.
  return results.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta)).slice(0, 5)
}

export { MONTHS_SHORT }
