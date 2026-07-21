import { useMemo, useState } from 'react'
import { useStore } from '../store/StoreContext'
import {
  addDays,
  formatDayLabel,
  formatFullDate,
  todayKey,
} from '../utils/dates'

type Filter = 'all' | 'active' | 'done'

export function Tasks() {
  const { data, addTask, toggleTask, deleteTask, carryOverTasks } = useStore()
  const [day, setDay] = useState(todayKey())
  const [title, setTitle] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  const dayTasks = useMemo(
    () =>
      data.tasks
        .filter((t) => t.date === day)
        .sort((a, b) => Number(a.done) - Number(b.done) || a.createdAt - b.createdAt),
    [data.tasks, day],
  )

  const shown = dayTasks.filter((t) =>
    filter === 'all' ? true : filter === 'active' ? !t.done : t.done,
  )
  const doneCount = dayTasks.filter((t) => t.done).length

  const prevDay = addDays(day, -1)
  const carryable = data.tasks.filter((t) => t.date === prevDay && !t.done).length

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    addTask(title, day)
    setTitle('')
  }

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Tasks</h1>
          <div className="sub">
            {doneCount} of {dayTasks.length} done
          </div>
        </div>
      </div>

      <div className="card">
        <div
          className="row"
          style={{ justifyContent: 'space-between', marginBottom: 14 }}
        >
          <button className="icon-btn" onClick={() => setDay(addDays(day, -1))}>
            ‹
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700 }}>{formatDayLabel(day)}</div>
            <div className="faint" style={{ fontSize: 12 }}>
              {formatFullDate(day)}
            </div>
          </div>
          <button
            className="icon-btn"
            onClick={() => setDay(addDays(day, 1))}
          >
            ›
          </button>
        </div>

        <form onSubmit={submit} className="row" style={{ marginBottom: 14 }}>
          <input
            className="input"
            placeholder="Add a task…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button className="btn primary" type="submit" disabled={!title.trim()}>
            Add
          </button>
        </form>

        {carryable > 0 && day === todayKey() && (
          <button
            className="btn sm block"
            style={{ marginBottom: 14 }}
            onClick={() => carryOverTasks(prevDay, day)}
          >
            ↩ Carry over {carryable} unfinished from yesterday
          </button>
        )}

        {dayTasks.length > 0 && (
          <div className="segmented" style={{ marginBottom: 8 }}>
            {(['all', 'active', 'done'] as Filter[]).map((f) => (
              <button
                key={f}
                className={filter === f ? 'on' : ''}
                onClick={() => setFilter(f)}
              >
                {f[0].toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        )}

        {shown.length === 0 ? (
          <div className="empty">
            <div className="emoji">🗒️</div>
            {dayTasks.length === 0
              ? 'No tasks yet. Add one above to get started.'
              : 'Nothing here.'}
          </div>
        ) : (
          <div className="list">
            {shown.map((t) => (
              <div className="list-item" key={t.id}>
                <div
                  className={'check' + (t.done ? ' on' : '')}
                  onClick={() => toggleTask(t.id)}
                  role="checkbox"
                  aria-checked={t.done}
                >
                  {t.done ? '✓' : ''}
                </div>
                <div className="grow">
                  <div className={t.done ? 'strike' : ''}>{t.title}</div>
                </div>
                <button
                  className="icon-btn"
                  onClick={() => deleteTask(t.id)}
                  aria-label="Delete"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
