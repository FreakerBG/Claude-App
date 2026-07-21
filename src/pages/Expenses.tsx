import { useMemo, useState } from 'react'
import { useStore } from '../store/StoreContext'
import { Modal } from '../components/Modal'
import { Donut, Slice } from '../components/Charts'
import { formatMoney } from '../utils/currency'
import {
  addMonths,
  formatDayLabel,
  formatMonthLabel,
  monthKey,
  todayKey,
} from '../utils/dates'

export function Expenses() {
  const { data, addExpense, deleteExpense } = useStore()
  const currency = data.settings.currency
  const [month, setMonth] = useState(monthKey(todayKey()))
  const [adding, setAdding] = useState(false)

  const monthExpenses = useMemo(
    () =>
      data.expenses
        .filter((e) => monthKey(e.date) === month)
        .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt)),
    [data.expenses, month],
  )

  const total = monthExpenses.reduce((s, e) => s + e.amount, 0)

  const catName = (id: string) =>
    data.categories.find((c) => c.id === id)?.name || 'Other'
  const catColor = (id: string) =>
    data.categories.find((c) => c.id === id)?.color || '#6b7280'

  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of monthExpenses)
      map.set(e.categoryId, (map.get(e.categoryId) || 0) + e.amount)
    return [...map.entries()]
      .map(([id, value]) => ({ id, value }))
      .sort((a, b) => b.value - a.value)
  }, [monthExpenses])

  const slices: Slice[] = byCategory.map((c) => ({
    label: catName(c.id),
    value: c.value,
    color: catColor(c.id),
  }))

  const budgets = data.categories.filter((c) => (c.monthlyBudget || 0) > 0)

  // group by day for the list
  const groups = useMemo(() => {
    const map = new Map<string, typeof monthExpenses>()
    for (const e of monthExpenses) {
      if (!map.has(e.date)) map.set(e.date, [])
      map.get(e.date)!.push(e)
    }
    return [...map.entries()]
  }, [monthExpenses])

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Expenses</h1>
          <div className="sub">Track where your money goes</div>
        </div>
        <button className="btn primary sm" onClick={() => setAdding(true)}>
          + Add
        </button>
      </div>

      <div className="card">
        <div
          className="row"
          style={{ justifyContent: 'space-between', marginBottom: 16 }}
        >
          <button
            className="icon-btn"
            onClick={() => setMonth(addMonths(month, -1))}
          >
            ‹
          </button>
          <div style={{ fontWeight: 700 }}>{formatMonthLabel(month)}</div>
          <button
            className="icon-btn"
            onClick={() => setMonth(addMonths(month, 1))}
          >
            ›
          </button>
        </div>

        <div
          className="row"
          style={{ justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}
        >
          <Donut
            slices={slices}
            centerLabel={monthExpenses.length ? formatMoney(total, currency).replace(/\.\d+$/, '') : ''}
            centerSub={monthExpenses.length ? 'spent' : ''}
          />
          <div style={{ minWidth: 180, flex: 1 }}>
            <div className="faint" style={{ fontSize: 13 }}>
              Total this month
            </div>
            <div className="stat-big">{formatMoney(total, currency)}</div>
            <div className="list" style={{ marginTop: 8 }}>
              {byCategory.slice(0, 6).map((c) => (
                <div
                  key={c.id}
                  className="row"
                  style={{ justifyContent: 'space-between', padding: '4px 0' }}
                >
                  <div className="row" style={{ gap: 8 }}>
                    <span
                      className="dot"
                      style={{ background: catColor(c.id) }}
                    />
                    <span className="muted">{catName(c.id)}</span>
                  </div>
                  <span style={{ fontWeight: 600 }}>
                    {formatMoney(c.value, currency)}
                  </span>
                </div>
              ))}
              {byCategory.length === 0 && (
                <div className="faint" style={{ fontSize: 14 }}>
                  No expenses yet this month.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {budgets.length > 0 && (
        <div className="card">
          <div className="card-title">Budgets</div>
          <div className="list">
            {budgets.map((c) => {
              const spent = byCategory.find((b) => b.id === c.id)?.value || 0
              const pct = Math.min(100, (spent / (c.monthlyBudget || 1)) * 100)
              const over = spent > (c.monthlyBudget || 0)
              return (
                <div key={c.id} style={{ padding: '8px 0' }}>
                  <div
                    className="row"
                    style={{ justifyContent: 'space-between', marginBottom: 6 }}
                  >
                    <span className="muted">{c.name}</span>
                    <span
                      style={{
                        fontSize: 13,
                        color: over ? 'var(--red)' : 'var(--text-dim)',
                        fontWeight: 600,
                      }}
                    >
                      {formatMoney(spent, currency)} /{' '}
                      {formatMoney(c.monthlyBudget || 0, currency)}
                    </span>
                  </div>
                  <div className="progress">
                    <span
                      style={{
                        width: `${pct}%`,
                        background: over ? 'var(--red)' : 'var(--brand)',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">Transactions</div>
        {groups.length === 0 ? (
          <div className="empty">
            <div className="emoji">💸</div>
            No expenses this month. Tap “Add” to log one.
          </div>
        ) : (
          groups.map(([date, items]) => (
            <div key={date} style={{ marginBottom: 6 }}>
              <div
                className="faint"
                style={{ fontSize: 12, fontWeight: 700, margin: '10px 0 2px' }}
              >
                {formatDayLabel(date)}
              </div>
              <div className="list">
                {items.map((e) => (
                  <div className="list-item" key={e.id}>
                    <span
                      className="dot"
                      style={{ background: catColor(e.categoryId), width: 12, height: 12 }}
                    />
                    <div className="grow">
                      <div>{catName(e.categoryId)}</div>
                      {e.note && (
                        <div className="faint" style={{ fontSize: 13 }}>
                          {e.note}
                        </div>
                      )}
                    </div>
                    <span style={{ fontWeight: 700 }}>
                      {formatMoney(e.amount, currency)}
                    </span>
                    <button
                      className="icon-btn"
                      onClick={() => deleteExpense(e.id)}
                      aria-label="Delete"
                    >
                      🗑
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {adding && (
        <AddExpenseModal
          month={month}
          onClose={() => setAdding(false)}
          onAdd={(payload) => {
            addExpense(payload)
            setAdding(false)
          }}
        />
      )}
    </>
  )
}

function AddExpenseModal({
  month,
  onClose,
  onAdd,
}: {
  month: string
  onClose: () => void
  onAdd: (p: {
    amount: number
    categoryId: string
    date: string
    note?: string
  }) => void
}) {
  const { data } = useStore()
  const defaultDate =
    monthKey(todayKey()) === month ? todayKey() : `${month}-01`
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState(
    data.categories[0]?.id || 'other',
  )
  const [note, setNote] = useState('')
  const [date, setDate] = useState(defaultDate)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return
    onAdd({ amount: amt, categoryId, date, note: note.trim() || undefined })
  }

  return (
    <Modal title="Add expense" onClose={onClose}>
      <form onSubmit={submit}>
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
        <div className="field">
          <label>Date</label>
          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="field">
          <label>Note (optional)</label>
          <input
            className="input"
            placeholder="e.g. groceries"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <button className="btn primary block" type="submit">
          Add expense
        </button>
      </form>
    </Modal>
  )
}
