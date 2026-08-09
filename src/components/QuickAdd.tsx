import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import { Modal } from './Modal'
import { todayKey } from '../utils/dates'
import { confettiBurst } from '../utils/confetti'
import { MOODS } from '../pages/Journal'
import { Icon } from './Icon'

type Mode = 'menu' | 'task' | 'expense' | 'mood' | 'habit'

export function QuickAdd() {
  const { data, addTask, addExpense, saveJournal, toggleHabit } = useStore()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>('menu')
  const today = todayKey()

  // local field state
  const [taskTitle, setTaskTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState(data.categories[0]?.id || 'other')
  const [mood, setMood] = useState(3)

  const close = () => {
    setOpen(false)
    setMode('menu')
    setTaskTitle('')
    setAmount('')
    setMood(3)
  }

  const todayEntry = data.journal.find((j) => j.date === today)

  return (
    <>
      <button
        className="fab"
        aria-label="Quick add"
        onClick={() => setOpen(true)}
      >
        <Icon name="plus" size={25} />
      </button>

      {open && (
        <Modal
          title={
            mode === 'menu'
              ? 'Quick add'
              : mode === 'task'
                ? 'New task'
                : mode === 'expense'
                  ? 'New expense'
                  : mode === 'mood'
                    ? "Today's mood"
                    : 'Tick a habit'
          }
          onClose={close}
        >
          {mode === 'menu' && (
            <div className="qa-grid">
              <button className="qa-btn" onClick={() => setMode('task')}>
                <span className="qa-emoji"><Icon name="tasks" /></span>Task
              </button>
              <button className="qa-btn" onClick={() => setMode('expense')}>
                <span className="qa-emoji"><Icon name="money" /></span>Expense
              </button>
              <button className="qa-btn" onClick={() => setMode('mood')}>
                <span className="qa-emoji">◉</span>Mood
              </button>
              <button className="qa-btn" onClick={() => setMode('habit')}>
                <span className="qa-emoji"><Icon name="habits" /></span>Habit
              </button>
            </div>
          )}

          {mode === 'task' && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!taskTitle.trim()) return
                addTask(taskTitle, today)
                close()
              }}
            >
              <input
                className="input"
                placeholder="What needs doing today?"
                autoFocus
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                style={{ marginBottom: 12 }}
              />
              <button className="btn primary block" type="submit">
                Add task
              </button>
            </form>
          )}

          {mode === 'expense' && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const amt = parseFloat(amount)
                if (!amt || amt <= 0) return
                addExpense({ amount: amt, categoryId, date: today })
                close()
              }}
            >
              <div className="field">
                <label>Amount</label>
                <input
                  className="input"
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  autoFocus
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Category</label>
                <select
                  className="select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  {data.categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <button className="btn primary block" type="submit">
                Log expense
              </button>
            </form>
          )}

          {mode === 'mood' && (
            <div>
              <div className="mood-scale" style={{ marginBottom: 16 }}>
                {MOODS.map((m, i) => (
                  <button
                    key={m}
                    type="button"
                    className={'mood-btn' + (mood === i + 1 ? ' on' : '')}
                    onClick={() => setMood(i + 1)}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <button
                className="btn primary block"
                onClick={() => {
                  saveJournal(
                    today,
                    mood,
                    todayEntry?.text || '',
                    todayEntry?.tags || [],
                  )
                  close()
                }}
              >
                Save mood
              </button>
            </div>
          )}

          {mode === 'habit' && (
            <div className="list">
              {data.habits.length === 0 && (
                <div className="faint" style={{ fontSize: 14 }}>
                  No habits yet — add some on the Habits page.
                </div>
              )}
              {data.habits.map((h) => {
                const done = !!data.habitLogs[h.id]?.[today]
                return (
                  <div className="list-item" key={h.id}>
                    <div
                      className={'check' + (done ? ' on' : '')}
                      onClick={(e) => {
                        if (!done) confettiBurst(e.clientX, e.clientY)
                        toggleHabit(h.id, today)
                      }}
                    >
                      {done ? '✓' : ''}
                    </div>
                    <div className="grow">
                      {h.emoji ? h.emoji + ' ' : ''}
                      {h.name}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Modal>
      )}
    </>
  )
}
