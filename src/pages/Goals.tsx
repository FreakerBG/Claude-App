import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import { Modal } from '../components/Modal'
import { formatFullDate } from '../utils/dates'

export function Goals() {
  const { data, addGoal, updateGoal, deleteGoal } = useStore()
  const [adding, setAdding] = useState(false)

  const sorted = [...data.goals].sort(
    (a, b) => Number(a.done) - Number(b.done) || b.createdAt - a.createdAt,
  )

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Goals</h1>
          <div className="sub">Track progress toward what matters</div>
        </div>
        <button className="btn primary sm" onClick={() => setAdding(true)}>
          + Add
        </button>
      </div>

      {sorted.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="emoji">🎯</div>
            No goals yet. Add one like “Save 2000” or “Run 100 km”.
          </div>
        </div>
      ) : (
        sorted.map((g) => {
          const pct = Math.min(
            100,
            g.targetValue > 0 ? (g.currentValue / g.targetValue) * 100 : 0,
          )
          const step = g.targetValue >= 100 ? Math.round(g.targetValue / 20) : 1
          return (
            <div className="card" key={g.id}>
              <div
                className="row"
                style={{ justifyContent: 'space-between', marginBottom: 4 }}
              >
                <div style={{ fontWeight: 700, fontSize: 17 }}>
                  {g.done ? '✅ ' : ''}
                  {g.title}
                </div>
                <button
                  className="icon-btn"
                  onClick={() => {
                    if (confirm(`Delete goal “${g.title}”?`)) deleteGoal(g.id)
                  }}
                  aria-label="Delete"
                >
                  🗑
                </button>
              </div>

              <div
                className="row"
                style={{ justifyContent: 'space-between', marginBottom: 8 }}
              >
                <span className="muted" style={{ fontWeight: 600 }}>
                  {g.currentValue.toLocaleString()} /{' '}
                  {g.targetValue.toLocaleString()} {g.unit}
                </span>
                <span className="faint" style={{ fontSize: 13 }}>
                  {Math.round(pct)}%
                </span>
              </div>

              <div className="progress" style={{ marginBottom: 12 }}>
                <span
                  style={{
                    width: `${pct}%`,
                    background: g.done ? 'var(--green)' : 'var(--brand)',
                  }}
                />
              </div>

              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div className="row" style={{ gap: 8 }}>
                  <button
                    className="btn sm"
                    onClick={() =>
                      updateGoal(g.id, {
                        currentValue: Math.max(0, g.currentValue - step),
                        done: false,
                      })
                    }
                  >
                    −{step}
                  </button>
                  <button
                    className="btn sm"
                    onClick={() => {
                      const next = g.currentValue + step
                      updateGoal(g.id, {
                        currentValue: next,
                        done: next >= g.targetValue,
                      })
                    }}
                  >
                    +{step}
                  </button>
                </div>
                {g.done ? (
                  <span className="pill" style={{ color: 'var(--green)' }}>
                    Completed 🎉
                  </span>
                ) : (
                  g.targetDate && (
                    <span className="faint" style={{ fontSize: 12 }}>
                      by {formatFullDate(g.targetDate)}
                    </span>
                  )
                )}
              </div>
            </div>
          )
        })
      )}

      {adding && (
        <AddGoalModal
          onClose={() => setAdding(false)}
          onAdd={(g) => {
            addGoal(g)
            setAdding(false)
          }}
        />
      )}
    </>
  )
}

function AddGoalModal({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (g: {
    title: string
    currentValue: number
    targetValue: number
    unit: string
    targetDate?: string
  }) => void
}) {
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('')
  const [unit, setUnit] = useState('')
  const [current, setCurrent] = useState('')
  const [targetDate, setTargetDate] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const t = parseFloat(target)
    if (!title.trim() || !t || t <= 0) return
    onAdd({
      title: title.trim(),
      targetValue: t,
      currentValue: parseFloat(current) || 0,
      unit: unit.trim() || '',
      targetDate: targetDate || undefined,
    })
  }

  return (
    <Modal title="New goal" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="field">
          <label>Goal</label>
          <input
            className="input"
            placeholder="e.g. Save for a trip"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="row">
          <div className="field" style={{ flex: 1 }}>
            <label>Target</label>
            <input
              className="input"
              type="number"
              inputMode="decimal"
              placeholder="2000"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Unit</label>
            <input
              className="input"
              placeholder="$ / km / books"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
            />
          </div>
        </div>
        <div className="row">
          <div className="field" style={{ flex: 1 }}>
            <label>Starting value</label>
            <input
              className="input"
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
            />
          </div>
          <div className="field" style={{ flex: 1 }}>
            <label>Target date (optional)</label>
            <input
              className="input"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>
        </div>
        <button className="btn primary block" type="submit">
          Add goal
        </button>
      </form>
    </Modal>
  )
}
