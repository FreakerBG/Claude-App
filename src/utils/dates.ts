// Date helpers. Everything is stored as local YYYY-MM-DD strings.

export function todayKey(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(key: string, n: number): string {
  const d = parseKey(key)
  d.setDate(d.getDate() + n)
  return todayKey(d)
}

export function monthKey(key: string): string {
  return key.slice(0, 7) // YYYY-MM
}

export function addMonths(monthK: string, n: number): string {
  const [y, m] = monthK.split('-').map(Number)
  const d = new Date(y, m - 1 + n, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function formatFullDate(key: string): string {
  const d = parseKey(key)
  return `${WEEKDAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`
}

export function formatDayLabel(key: string): string {
  const t = todayKey()
  if (key === t) return 'Today'
  if (key === addDays(t, -1)) return 'Yesterday'
  if (key === addDays(t, 1)) return 'Tomorrow'
  return formatFullDate(key)
}

export function formatMonthLabel(monthK: string): string {
  const [y, m] = monthK.split('-').map(Number)
  return `${MONTHS[m - 1]} ${y}`
}

// last N day-keys ending today (oldest first)
export function lastNDays(n: number, end: string = todayKey()): string[] {
  const out: string[] = []
  for (let i = n - 1; i >= 0; i--) out.push(addDays(end, -i))
  return out
}

export function shortWeekday(key: string): string {
  return WEEKDAYS[parseKey(key).getDay()]
}

export function greeting(d: Date = new Date()): string {
  const h = d.getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}
