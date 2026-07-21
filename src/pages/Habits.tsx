import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import { Modal } from '../components/Modal'
import { lastNDays, shortWeekday, todayKey } from '../utils/dates'
import { bestStreak, currentStreak } from '../utils/streak'
import { confettiBurst } from '../utils/confetti'

const EMOJI_CHOICES = ['💪', '📚', '🏃', '💧', '🧘', '🥗', '😴', '✍️', '🎯', '🚭']

export function Habits() {
  const { data, addHabit, toggleHabit, deleteHabit } = useStore()
  const [adding, setAdding] = useState(false)
  const today = todayKey()
  const week = lastNDays(7)

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Habits</h1>
          <div className="sub">Build streaks, one day at a time</div>
        </div>
        <button className="btn primary sm" onClick={() => setAdding(true)}>
          + Add
        </button>
      </div>

      {data.habits.length === 0 ? (
        <div className="card">
          <div className="empty">
            <div className="emoji">🔥</div>
            No habits yet. Add one like “Drink water” or “Read 20 min”.
          </div>
        </div>
      ) : (
        data.habits.map((h) => {
          const log = data.habitLogs[h.id]
          const doneToday = !!log?.[today]
          const streak = currentStreak(log, today)
          const best = bestStreak(log)
          return (
            <div className="card" key={h.id}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <div className="row" style={{ gap: 12 }}>
                  <div
                    className={'check' + (doneToday ? ' on' : '')}
                    onClick={(e) => {
                      if (!doneToday) confettiBurst(e.clientX, e.clientY)
                      toggleHabit(h.id, today)
                    }}
                    role="checkbox"
                    aria-checked={doneToday}
                  >
                    {doneToday ? '✓' : ''}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700 }}>
                      {h.emoji ? h.emoji + ' ' : ''}
                      {h.name}
                    </div>
                    <div className="faint" style={{ fontSize: 13 }}>
                      🔥 {streak} day{streak === 1 ? '' : 's'} · best {best}
                    </div>
                  </div>
                </div>
                <button
                  className="icon-btn"
                  onClick={() => {
                    if (confirm(`Delete habit “${h.name}”?`)) deleteHabit(h.id)
                  }}
                  aria-label="Delete"
                >
                  🗑
                </button>
              </div>

              <div className="week-grid" style={{ marginTop: 14 }}>
                {week.map((d) => (
                  <div
                    key={d}
                    className={
                      'week-cell' +
                      (log?.[d] ? ' on' : '') +
                      (d === today ? ' today' : '')
                    }
                    onClick={() => toggleHabit(h.id, d)}
                    title={d}
                  >
                    {shortWeekday(d)[0]}
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}

      {adding && (
        <AddHabitModal
          onClose={() => setAdding(false)}
          onAdd={(name, emoji) => {
            addHabit(name, emoji)
            setAdding(false)
          }}
        />
      )}
    </>
  )
}

function AddHabitModal({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (name: string, emoji?: string) => void
}) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState<string>('💪')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd(name, emoji)
  }

  return (
    <Modal title="New habit" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="field">
          <label>Name</label>
          <input
            className="input"
            placeholder="e.g. Read 20 minutes"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Icon</label>
          <div className="row wrap" style={{ gap: 8 }}>
            {EMOJI_CHOICES.map((em) => (
              <button
                type="button"
                key={em}
                className="mood-btn"
                style={{
                  flex: '0 0 auto',
                  width: 48,
                  fontSize: 22,
                  borderColor: emoji === em ? 'var(--brand)' : 'var(--border)',
                  background: emoji === em ? 'var(--brand-soft)' : 'var(--surface)',
                }}
                onClick={() => setEmoji(em)}
              >
                {em}
              </button>
            ))}
          </div>
        </div>
        <button className="btn primary block" type="submit">
          Add habit
        </button>
      </form>
    </Modal>
  )
}
