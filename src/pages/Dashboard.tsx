import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { useStore } from '../store/StoreContext'
import { formatFullDate, greeting, monthKey, todayKey } from '../utils/dates'
import { formatMoney } from '../utils/currency'
import { currentStreak } from '../utils/streak'
import { computeMomentum, encouragement } from '../utils/gamification'
import { confettiBurst } from '../utils/confetti'
import { MOODS } from './Journal'

export function Dashboard() {
  const { data, toggleTask, toggleHabit } = useStore()
  const today = todayKey()
  const currency = data.settings.currency
  const [nudgeDismissed, setNudgeDismissed] = useState(false)

  const todayTasks = data.tasks.filter((task) => task.date === today)
  const doneTasks = todayTasks.filter((task) => task.done).length
  const monthEntries = data.expenses.filter(
    (entry) => monthKey(entry.date) === monthKey(today),
  )
  const monthSpent = monthEntries
    .filter((entry) => entry.type !== 'income')
    .reduce((sum, entry) => sum + entry.amount, 0)
  const monthIncome = monthEntries
    .filter((entry) => entry.type === 'income')
    .reduce((sum, entry) => sum + entry.amount, 0)
  const monthNet = monthIncome - monthSpent

  const habitsDone = data.habits.filter(
    (habit) => data.habitLogs[habit.id]?.[today],
  ).length
  const activeGoals = data.goals.filter((goal) => !goal.done).slice(0, 3)
  const todayMood = data.journal.find((entry) => entry.date === today)
  const momentum = computeMomentum(data)
  const name = data.settings.name.trim()

  const tapTask = (event: React.MouseEvent, id: string, wasDone: boolean) => {
    if (!wasDone) confettiBurst(event.clientX, event.clientY)
    toggleTask(id)
  }

  const tapHabit = (event: React.MouseEvent, id: string, wasDone: boolean) => {
    if (!wasDone) confettiBurst(event.clientX, event.clientY)
    toggleHabit(id, today)
  }

  const pendingTasks = todayTasks.length - doneTasks
  const pendingHabits = data.habits.length - habitsDone
  const nudgeBits: string[] = []
  if (pendingTasks > 0) nudgeBits.push(`${pendingTasks} task${pendingTasks > 1 ? 's' : ''}`)
  if (pendingHabits > 0) nudgeBits.push(`${pendingHabits} habit${pendingHabits > 1 ? 's' : ''}`)
  if (!todayMood && data.journal.length > 0) nudgeBits.push('mood check-in')
  const showNudge = !nudgeDismissed && nudgeBits.length > 0

  return (
    <>
      <div className="page-head dashboard-head">
        <div>
          <div className="eyebrow"><span /> MOMENTUM // PERSONAL OS</div>
          <h1>{greeting()}{name ? `, ${name}` : ''}</h1>
          <div className="sub">{formatFullDate(today)} · Sofia</div>
        </div>
        <div className="row head-actions">
          <Link to="/insights" className="icon-btn" aria-label="Insights">
            <Icon name="insights" />
          </Link>
          <Link to="/settings" className="icon-btn" aria-label="Settings">
            <Icon name="settings" />
          </Link>
        </div>
      </div>

      <Link to="/insights" className="command-hero">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-scan" aria-hidden="true" />
        <div className="hero-copy">
          <div className="status-pill"><span /> LIVE STATUS</div>
          <h2>{momentum.levelName}</h2>
          <p>{encouragement(data, today)}</p>
          <div className="hero-metrics">
            <div><strong>{momentum.score.toLocaleString()}</strong><span>Total points</span></div>
            <div><strong>{doneTasks}/{todayTasks.length}</strong><span>Tasks today</span></div>
            <div><strong>{habitsDone}/{data.habits.length}</strong><span>Habits synced</span></div>
          </div>
        </div>
        <div className="level-orbit" style={{ ['--p' as string]: Math.round(momentum.progress * 100) }}>
          <span className="orbit-dot" />
          <div className="orbit-inner">
            <span className="orbit-kicker">LEVEL</span>
            <strong>{momentum.level}</strong>
            <span>{Math.round(momentum.progress * 100)}%</span>
          </div>
        </div>
      </Link>

      {showNudge && (
        <div className="nudge">
          <span className="nudge-icon"><Icon name="pulse" /></span>
          <div className="grow">
            <div className="n-title">Next best actions</div>
            <div className="n-sub">{nudgeBits.join(' · ')} — keep the signal moving.</div>
          </div>
          <button className="icon-btn" onClick={() => setNudgeDismissed(true)} aria-label="Dismiss">
            <Icon name="close" size={17} />
          </button>
        </div>
      )}

      <div className="grid cols-2 dashboard-grid">
        <section className="card telemetry-card accent-cyan">
          <div className="card-topline">
            <div><span className="card-index">01</span><div className="card-title">Today’s tasks</div></div>
            <Link to="/tasks" className="card-link">OPEN <span>→</span></Link>
          </div>
          <div className="stat-row"><span className="stat-big">{doneTasks}</span><span className="muted">of {todayTasks.length} complete</span></div>
          <div className="progress"><span style={{ width: `${todayTasks.length ? (doneTasks / todayTasks.length) * 100 : 0}%` }} /></div>
          {todayTasks.length === 0 ? (
            <Link to="/tasks" className="btn sm block">+ Add today’s tasks</Link>
          ) : (
            <div className="list compact-list">
              {todayTasks.slice(0, 4).map((task) => (
                <div className="list-item" key={task.id}>
                  <button className={'check' + (task.done ? ' on' : '')} onClick={(event) => tapTask(event, task.id, task.done)} aria-label={`Mark ${task.title} ${task.done ? 'open' : 'done'}`}>
                    {task.done ? '✓' : ''}
                  </button>
                  <div className={'grow truncate' + (task.done ? ' strike' : '')}>{task.title}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card telemetry-card accent-blue">
          <div className="card-topline">
            <div><span className="card-index">02</span><div className="card-title">Financial pulse</div></div>
            <Link to="/expenses" className="card-link">DETAILS <span>→</span></Link>
          </div>
          <div className="money-main"><span>NET THIS MONTH</span><strong className={monthNet < 0 ? 'negative' : ''}>{formatMoney(monthNet, currency)}</strong></div>
          <div className="finance-split">
            <div><span>Income</span><strong className="positive">{formatMoney(monthIncome, currency)}</strong></div>
            <div><span>Spent</span><strong>{formatMoney(monthSpent, currency)}</strong></div>
          </div>
          <Link to="/expenses" className="btn sm block">+ Log transaction</Link>
        </section>

        <section className="card telemetry-card accent-green">
          <div className="card-topline">
            <div><span className="card-index">03</span><div className="card-title">Habit systems</div></div>
            <Link to="/habits" className="card-link">OPEN <span>→</span></Link>
          </div>
          {data.habits.length === 0 ? (
            <Link to="/habits" className="btn sm block">+ Create a habit</Link>
          ) : (
            <>
              <div className="stat-row"><span className="stat-big">{habitsDone}</span><span className="muted">of {data.habits.length} synced</span></div>
              <div className="list compact-list">
                {data.habits.slice(0, 4).map((habit) => {
                  const done = !!data.habitLogs[habit.id]?.[today]
                  const streak = currentStreak(data.habitLogs[habit.id], today)
                  return (
                    <div className="list-item" key={habit.id}>
                      <button className={'check' + (done ? ' on' : '')} onClick={(event) => tapHabit(event, habit.id, done)} aria-label={`Mark ${habit.name} ${done ? 'open' : 'done'}`}>
                        {done ? '✓' : ''}
                      </button>
                      <div className="grow truncate">{habit.emoji ? `${habit.emoji} ` : ''}{habit.name}</div>
                      <span className="streak-chip">{streak} DAYS</span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </section>

        <section className="card telemetry-card accent-violet">
          <div className="card-topline">
            <div><span className="card-index">04</span><div className="card-title">Mission progress</div></div>
            <Link to="/goals" className="card-link">OPEN <span>→</span></Link>
          </div>
          {activeGoals.length === 0 ? (
            <Link to="/goals" className="btn sm block">+ Set a mission</Link>
          ) : (
            <div className="list goal-list">
              {activeGoals.map((goal) => {
                const progress = Math.min(100, goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0)
                return (
                  <div key={goal.id} className="goal-row">
                    <div className="row"><span className="truncate">{goal.title}</span><strong>{Math.round(progress)}%</strong></div>
                    <div className="progress"><span style={{ width: `${progress}%` }} /></div>
                  </div>
                )
              })}
            </div>
          )}
          <Link to="/journal" className="mood-link">
            <span><small>EMOTIONAL SIGNAL</small>Today’s mood</span>
            <strong>{todayMood ? MOODS[todayMood.mood - 1] : '＋'}</strong>
          </Link>
        </section>
      </div>
    </>
  )
}
