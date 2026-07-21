import { Link } from 'react-router-dom'
import { useStore } from '../store/StoreContext'
import { formatFullDate, greeting, monthKey, todayKey } from '../utils/dates'
import { formatMoney } from '../utils/currency'
import { currentStreak } from '../utils/streak'
import { MOODS } from './Journal'

export function Dashboard() {
  const { data, toggleTask, toggleHabit } = useStore()
  const today = todayKey()
  const currency = data.settings.currency

  const todayTasks = data.tasks.filter((t) => t.date === today)
  const doneTasks = todayTasks.filter((t) => t.done).length

  const monthTotal = data.expenses
    .filter((e) => monthKey(e.date) === monthKey(today))
    .reduce((s, e) => s + e.amount, 0)

  const habitsDone = data.habits.filter(
    (h) => data.habitLogs[h.id]?.[today],
  ).length

  const activeGoals = data.goals.filter((g) => !g.done).slice(0, 3)
  const todayMood = data.journal.find((j) => j.date === today)

  const name = data.settings.name.trim()

  return (
    <>
      <div className="page-head">
        <div>
          <h1>
            {greeting()}
            {name ? `, ${name}` : ''} 👋
          </h1>
          <div className="sub">{formatFullDate(today)}</div>
        </div>
        <Link to="/settings" className="icon-btn" aria-label="Settings">
          ⚙️
        </Link>
      </div>

      <div className="grid cols-2">
        {/* Tasks */}
        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="card-title" style={{ margin: 0 }}>
              Today’s tasks
            </div>
            <Link to="/tasks" className="faint" style={{ fontSize: 13 }}>
              View all →
            </Link>
          </div>
          <div className="stat-row" style={{ margin: '10px 0 12px' }}>
            <span className="stat-big">{doneTasks}</span>
            <span className="muted">/ {todayTasks.length} done</span>
          </div>
          <div className="progress" style={{ marginBottom: 12 }}>
            <span
              style={{
                width: `${
                  todayTasks.length ? (doneTasks / todayTasks.length) * 100 : 0
                }%`,
              }}
            />
          </div>
          {todayTasks.length === 0 ? (
            <Link to="/tasks" className="btn sm block">
              + Add today’s tasks
            </Link>
          ) : (
            <div className="list">
              {todayTasks.slice(0, 4).map((t) => (
                <div className="list-item" key={t.id} style={{ padding: '8px 0' }}>
                  <div
                    className={'check' + (t.done ? ' on' : '')}
                    onClick={() => toggleTask(t.id)}
                    style={{ width: 20, height: 20, fontSize: 11 }}
                  >
                    {t.done ? '✓' : ''}
                  </div>
                  <div className={'grow truncate' + (t.done ? ' strike' : '')}>
                    {t.title}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Spending */}
        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="card-title" style={{ margin: 0 }}>
              This month
            </div>
            <Link to="/expenses" className="faint" style={{ fontSize: 13 }}>
              Details →
            </Link>
          </div>
          <div style={{ margin: '10px 0 4px' }} className="faint">
            Spent so far
          </div>
          <div className="stat-big">{formatMoney(monthTotal, currency)}</div>
          <Link
            to="/expenses"
            className="btn sm block"
            style={{ marginTop: 14 }}
          >
            + Log an expense
          </Link>
        </div>

        {/* Habits */}
        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="card-title" style={{ margin: 0 }}>
              Habits today
            </div>
            <Link to="/habits" className="faint" style={{ fontSize: 13 }}>
              View all →
            </Link>
          </div>
          {data.habits.length === 0 ? (
            <Link to="/habits" className="btn sm block" style={{ marginTop: 12 }}>
              + Add a habit
            </Link>
          ) : (
            <>
              <div className="stat-row" style={{ margin: '10px 0 12px' }}>
                <span className="stat-big">{habitsDone}</span>
                <span className="muted">/ {data.habits.length} done</span>
              </div>
              <div className="list">
                {data.habits.slice(0, 4).map((h) => {
                  const done = !!data.habitLogs[h.id]?.[today]
                  const streak = currentStreak(data.habitLogs[h.id], today)
                  return (
                    <div
                      className="list-item"
                      key={h.id}
                      style={{ padding: '8px 0' }}
                    >
                      <div
                        className={'check' + (done ? ' on' : '')}
                        onClick={() => toggleHabit(h.id, today)}
                        style={{ width: 20, height: 20, fontSize: 11 }}
                      >
                        {done ? '✓' : ''}
                      </div>
                      <div className="grow truncate">
                        {h.emoji ? h.emoji + ' ' : ''}
                        {h.name}
                      </div>
                      <span className="faint" style={{ fontSize: 12 }}>
                        🔥 {streak}
                      </span>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Goals + mood */}
        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="card-title" style={{ margin: 0 }}>
              Goals
            </div>
            <Link to="/goals" className="faint" style={{ fontSize: 13 }}>
              View all →
            </Link>
          </div>
          {activeGoals.length === 0 ? (
            <Link to="/goals" className="btn sm block" style={{ marginTop: 12 }}>
              + Set a goal
            </Link>
          ) : (
            <div className="list">
              {activeGoals.map((g) => {
                const pct = Math.min(
                  100,
                  g.targetValue > 0 ? (g.currentValue / g.targetValue) * 100 : 0,
                )
                return (
                  <div key={g.id} style={{ padding: '8px 0' }}>
                    <div
                      className="row"
                      style={{ justifyContent: 'space-between', marginBottom: 6 }}
                    >
                      <span className="truncate" style={{ fontWeight: 600 }}>
                        {g.title}
                      </span>
                      <span className="faint" style={{ fontSize: 12 }}>
                        {Math.round(pct)}%
                      </span>
                    </div>
                    <div className="progress">
                      <span style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div
            className="row"
            style={{
              justifyContent: 'space-between',
              marginTop: 14,
              paddingTop: 12,
              borderTop: '1px solid var(--border)',
            }}
          >
            <span className="muted">Today’s mood</span>
            <Link to="/journal" style={{ fontSize: 22 }}>
              {todayMood ? MOODS[todayMood.mood - 1] : '＋'}
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
