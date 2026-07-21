import { addDays, todayKey } from './dates'

// Current streak = consecutive done-days ending today (or yesterday if today
// is not yet ticked — so a streak isn't "broken" just because today is pending).
export function currentStreak(
  log: Record<string, boolean> | undefined,
  end: string = todayKey(),
): number {
  if (!log) return 0
  let count = 0
  let cursor = log[end] ? end : addDays(end, -1)
  // if neither today nor yesterday is done, streak is 0
  if (!log[cursor]) return 0
  while (log[cursor]) {
    count++
    cursor = addDays(cursor, -1)
  }
  return count
}

// Best streak = longest run of consecutive done-days ever.
export function bestStreak(log: Record<string, boolean> | undefined): number {
  if (!log) return 0
  const days = Object.keys(log)
    .filter((k) => log[k])
    .sort()
  let best = 0
  let run = 0
  let prev: string | null = null
  for (const day of days) {
    if (prev !== null && addDays(prev, 1) === day) run++
    else run = 1
    if (run > best) best = run
    prev = day
  }
  return best
}
