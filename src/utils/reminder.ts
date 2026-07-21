import { useEffect, useRef } from 'react'
import { AppData } from '../store/types'
import { todayKey } from './dates'

export function notificationsSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window
}

export async function requestNotifyPermission(): Promise<NotificationPermission> {
  if (!notificationsSupported()) return 'denied'
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}

const LAST_KEY = 'momentum:lastReminded'

function pendingSummary(data: AppData): string | null {
  const today = todayKey()
  const tasks = data.tasks.filter((t) => t.date === today)
  const pendingTasks = tasks.filter((t) => !t.done).length
  const pendingHabits = data.habits.filter(
    (h) => !data.habitLogs[h.id]?.[today],
  ).length
  const needsMood = !data.journal.find((j) => j.date === today)
  const bits: string[] = []
  if (pendingTasks) bits.push(`${pendingTasks} task${pendingTasks > 1 ? 's' : ''}`)
  if (pendingHabits)
    bits.push(`${pendingHabits} habit${pendingHabits > 1 ? 's' : ''}`)
  if (needsMood && data.journal.length) bits.push('a mood check-in')
  if (!bits.length) return null
  return `You still have ${bits.join(', ')} today. One small step counts.`
}

// Best-effort daily reminder. Web/iOS can't reliably fire notifications in the
// background, so this fires while the app is open (or on the next open after the
// set time) — a gentle, once-per-day nudge.
export function useReminder(data: AppData) {
  const dataRef = useRef(data)
  dataRef.current = data

  const enabled = !!data.settings.reminderEnabled
  const time = data.settings.reminderTime || '20:00'

  useEffect(() => {
    if (!enabled || !notificationsSupported()) return
    if (Notification.permission !== 'granted') return

    let timer: number | undefined

    const fire = () => {
      const today = todayKey()
      if (localStorage.getItem(LAST_KEY) === today) return
      const body = pendingSummary(dataRef.current)
      if (!body) return
      try {
        new Notification('Momentum', { body, icon: 'icons/icon-192.png' })
        localStorage.setItem(LAST_KEY, today)
      } catch {
        /* ignore */
      }
    }

    const schedule = () => {
      const [h, m] = time.split(':').map(Number)
      const now = new Date()
      const target = new Date()
      target.setHours(h, m, 0, 0)
      // If the time already passed today, fire soon (caught up on open).
      if (target.getTime() <= now.getTime()) {
        window.setTimeout(fire, 1500)
        // schedule tomorrow
        target.setDate(target.getDate() + 1)
      }
      const delay = target.getTime() - Date.now()
      timer = window.setTimeout(() => {
        fire()
        schedule()
      }, Math.max(1000, delay))
    }

    schedule()
    return () => {
      if (timer) window.clearTimeout(timer)
    }
  }, [enabled, time])
}
