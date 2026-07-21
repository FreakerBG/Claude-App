import { AppData } from '../store/types'
import { bestStreak, currentStreak } from './streak'

// Points are DERIVED from data (never stored) so they can't drift or double-count.
export const POINTS = {
  task: 10,
  habit: 15,
  journal: 12,
  goalDone: 60,
}

export interface Badge {
  id: string
  label: string
  emoji: string
  desc: string
  earned: boolean
}

export interface Momentum {
  score: number
  level: number
  levelName: string
  intoLevel: number // points earned into the current level
  levelSpan: number // points needed to clear the current level
  progress: number // 0..1 within the current level
  badges: Badge[]
  earnedCount: number
}

const LEVEL_NAMES = [
  'Spark', 'Starter', 'Builder', 'Steady', 'Focused',
  'Driven', 'Relentless', 'Unstoppable', 'Legend', 'Mythic',
]

// Level thresholds grow gently: level n needs 50*n points into it.
function levelFor(score: number): {
  level: number
  intoLevel: number
  levelSpan: number
} {
  let level = 1
  let remaining = score
  let span = 100
  while (remaining >= span) {
    remaining -= span
    level += 1
    span = 100 + (level - 1) * 50
  }
  return { level, intoLevel: remaining, levelSpan: span }
}

export function computeMomentum(data: AppData): Momentum {
  const doneTasks = data.tasks.filter((t) => t.done).length
  const habitTicks = Object.values(data.habitLogs).reduce(
    (sum, log) => sum + Object.values(log).filter(Boolean).length,
    0,
  )
  const journalCount = data.journal.length
  const goalsDone = data.goals.filter((g) => g.done).length

  const score =
    doneTasks * POINTS.task +
    habitTicks * POINTS.habit +
    journalCount * POINTS.journal +
    goalsDone * POINTS.goalDone

  const { level, intoLevel, levelSpan } = levelFor(score)
  const levelName = LEVEL_NAMES[Math.min(level - 1, LEVEL_NAMES.length - 1)]

  // Best streak across all habits (for streak badges).
  const bestAnyStreak = Object.values(data.habitLogs).reduce(
    (m, log) => Math.max(m, bestStreak(log)),
    0,
  )
  const anyCurrent = Object.values(data.habitLogs).reduce(
    (m, log) => Math.max(m, currentStreak(log)),
    0,
  )

  const badges: Badge[] = [
    {
      id: 'first-task',
      label: 'First step',
      emoji: '✅',
      desc: 'Complete your first task',
      earned: doneTasks >= 1,
    },
    {
      id: 'ten-tasks',
      label: 'On a roll',
      emoji: '🔟',
      desc: 'Complete 10 tasks',
      earned: doneTasks >= 10,
    },
    {
      id: 'fifty-tasks',
      label: 'Machine',
      emoji: '⚙️',
      desc: 'Complete 50 tasks',
      earned: doneTasks >= 50,
    },
    {
      id: 'first-habit',
      label: 'Habit born',
      emoji: '🌱',
      desc: 'Check off a habit',
      earned: habitTicks >= 1,
    },
    {
      id: 'streak-7',
      label: 'One week',
      emoji: '🔥',
      desc: 'Reach a 7-day habit streak',
      earned: bestAnyStreak >= 7 || anyCurrent >= 7,
    },
    {
      id: 'streak-30',
      label: 'Iron will',
      emoji: '⛰️',
      desc: 'Reach a 30-day habit streak',
      earned: bestAnyStreak >= 30 || anyCurrent >= 30,
    },
    {
      id: 'first-goal',
      label: 'Goal getter',
      emoji: '🎯',
      desc: 'Complete a goal',
      earned: goalsDone >= 1,
    },
    {
      id: 'journal-7',
      label: 'Reflective',
      emoji: '📓',
      desc: 'Write 7 journal entries',
      earned: journalCount >= 7,
    },
    {
      id: 'budgeter',
      label: 'Budgeter',
      emoji: '💰',
      desc: 'Set a budget on a category',
      earned: data.categories.some((c) => (c.monthlyBudget || 0) > 0),
    },
    {
      id: 'level-5',
      label: 'High gear',
      emoji: '🚀',
      desc: 'Reach level 5',
      earned: level >= 5,
    },
  ]

  return {
    score,
    level,
    levelName,
    intoLevel,
    levelSpan,
    progress: levelSpan > 0 ? intoLevel / levelSpan : 0,
    badges,
    earnedCount: badges.filter((b) => b.earned).length,
  }
}

// A gentle, encouraging line for the dashboard (never guilt-trips).
export function encouragement(data: AppData, todayKey: string): string {
  const todayTasks = data.tasks.filter((t) => t.date === todayKey)
  const done = todayTasks.filter((t) => t.done).length
  const habitsDone = data.habits.filter(
    (h) => data.habitLogs[h.id]?.[todayKey],
  ).length
  if (todayTasks.length && done === todayTasks.length)
    return 'Every task done today — beautiful work. 🎉'
  if (habitsDone > 0 || done > 0) return "You're building momentum. Keep going!"
  if (data.habits.length || todayTasks.length)
    return 'A tiny step counts. Pick one thing to start.'
  return 'Welcome back. What would make today a win?'
}
