import { useMemo, useState } from 'react'
import { useStore } from '../store/StoreContext'
import { Modal } from '../components/Modal'
import { YouTubeFamily } from '../components/YouTubeFamily'
import { Donut, Slice } from '../components/Charts'
import { formatMoney } from '../utils/currency'
import { EntryType } from '../store/types'
import {
  addMonths,
  formatDayLabel,
  formatMonthLabel,
  monthKey,
  parseKey,
  todayKey,
} from '../utils/dates'

export function Expenses() {
  const {
    data,
    addExpense,
    deleteExpense,
    addSubscription,
    deleteSubscription,
  } = useStore()
  const currency = data.settings.currency
  const [month, setMonth] = useState(monthKey(todayKey()))
  const [adding, setAdding] = useState(false)
  const [addingSub, setAddingSub] = useState(false)

  const catName = (id: string) =>
    id === 'income'
      ? 'Income'
      : data.categories.find((c) => c.id === id)?.name || 'Other'
  const catColor = (id: string) =>
    id === 'income'
      ? '#10b981'
      : data.categories.find((c) => c.id === id)?.color || '#6b7280'

  const monthEntries = useMemo(
    () =>
      data.expenses
        .filter((e) => monthKey(e.date) === month)
        .sort((a, b) =>
          a.date < b.date ? 1 : a.date > b.date ? -1 : b.createdAt - a.createdAt,
        ),
    [data.expenses, month],
  )

  const spending = monthEntries.filter((e) => e.type !== 'income')
  const totalSpent = spending.reduce((s, e) => s + e.amount, 0)
  const totalIncome = monthEntries
    .filter((e) => e.type === 'income')
    .reduce((s, e) => s + e.amount, 0)
  const net = totalIncome - totalSpent

  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of spending)
      map.set(e.categoryId, (map.get(e.categoryId) || 0) + e.amount)
    return [...map.entries()]
      .map(([id, value]) => ({ id, value }))
      .sort((a, b) => b.value - a.value)
  }, [spending])

  const slices: Slice[] = byCategory.map((c) => ({
    label: catName(c.id),
    value: c.value,
    color: catColor(c.id),
  }))

  const budgets = data.categories.filter((c) => (c.monthlyBudget || 0) > 0)

  const groups = useMemo(() => {
    const map = new Map<string, typeof monthEntries>()
    for (const e of monthEntries) {
      if (!map.has(e.date)) map.set(e.date, [])
      map.get(e.date)!.push(e)
    }
    return [...map.entries()]
  }, [monthEntries])

  const subsMonthly = data.subscriptions
    .filter((s) => s.active)
    .reduce((s, x) => s + x.amount, 0)
  const isThisMonth = month === monthKey(todayKey())
  const curDay = parseKey(todayKey()).getDate()

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Money</h1>
          <div className="sub">Spending, income & bills</div>
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
          <button className="icon-btn" onClick={() => setMonth(addMonths(month, -1))}>
            ‹
          </button>
          <div style={{ fontWeight: 700 }}>{formatMonthLabel(month)}</div>
          <button className="icon-btn" onClick={() => setMonth(addMonths(month, 1))}>
            ›
          </button>
        </div>

        <div className="triple" style={{ marginBottom: 18 }}>
          <div className="t-cell">
            <div className="t-label">Income</div>
            <div className="t-val" style={{ color: 'var(--green)' }}>
              {formatMoney(totalIncome, currency)}
            </div>
          </div>
          <div className="t-cell">
            <div className="t-label">Spent</div>
            <div className="t-val">{formatMoney(totalSpent, currency)}</div>
          </div>
          <div className="t-cell">
            <div className="t-label">Net</div>
            <div
              className="t-val"
              style={{ color: net >= 0 ? 'var(--green)' : 'var(--red)' }}
            >
              {net >= 0 ? '+' : ''}
              {formatMoney(net, currency)}
            </div>
          </div>
        </div>

        <div
          className="row"
          style={{ justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}
        >
          <Donut
            slices={slices}
            centerLabel={
              spending.length
                ? formatMoney(totalSpent, currency).replace(/\.\d+$/, '')
                : ''
            }
            centerSub={spending.length ? 'spent' : ''}
          />
          <div style={{ minWidth: 180, flex: 1 }}>
            <div className="faint" style={{ fontSize: 13 }}>
              By category
            </div>
            <div className="list" style={{ marginTop: 8 }}>
              {byCategory.slice(0, 6).map((c) => (
                <div
                  key={c.id}
                  className="row"
                  style={{ justifyContent: 'space-between', padding: '4px 0' }}
                >
                  <div className="row" style={{ gap: 8 }}>
                    <span className="dot" style={{ background: catColor(c.id) }} />
                    <span className="muted">{catName(c.id)}</span>
                  </div>
                  <span style={{ fontWeight: 600 }}>
                    {formatMoney(c.value, currency)}
                  </span>
                </div>
              ))}
              {byCategory.length === 0 && (
                <div className="faint" style={{ fontSize: 14 }}>
                  No spending yet this month.
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

      {/* Subscriptions / recurring bills */}
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="card-title" style={{ margin: 0 }}>
            Subscriptions & bills
          </div>
          <button className="btn sm ghost" onClick={() => setAddingSub(true)}>
            + Add
          </button>
        </div>
        {data.subscriptions.length === 0 ? (
          <div className="faint" style={{ fontSize: 14, marginTop: 10 }}>
            Add recurring bills (rent, Netflix…) and they’ll be logged
            automatically each month.
          </div>
        ) : (
          <>
            <div className="muted" style={{ fontSize: 13, margin: '6px 0 4px' }}>
              {formatMoney(subsMonthly, currency)} / month across{' '}
              {data.subscriptions.filter((s) => s.active).length}
            </div>
            <div className="list">
              {data.subscriptions.map((s) => {
                const upcoming = isThisMonth && curDay < s.dayOfMonth
                return (
                  <div className="list-item" key={s.id}>
                    <span
                      className="dot"
                      style={{
                        background: catColor(s.categoryId),
                        width: 12,
                        height: 12,
                      }}
                    />
                    <div className="grow">
                      <div>{s.name}</div>
                      <div className="faint" style={{ fontSize: 12 }}>
                        day {s.dayOfMonth} · {catName(s.categoryId)}
                      </div>
                    </div>
                    {upcoming && (
                      <span className="pill" style={{ color: 'var(--amber)' }}>
                        upcoming
                      </span>
                    )}
                    <span style={{ fontWeight: 700 }}>
                      {formatMoney(s.amount, currency)}
                    </span>
                    <button
                      className="icon-btn"
                      onClick={() => {
                        if (confirm(`Delete subscription “${s.name}”?`))
                          deleteSubscription(s.id)
                      }}
                      aria-label="Delete"
                    >
                      🗑
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      <div className="card">
        <div className="card-title">Transactions</div>
        {groups.length === 0 ? (
          <div className="empty">
            <div className="emoji">💸</div>
            Nothing this month. Tap “Add” to log spending or income.
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
                {items.map((e) => {
                  const income = e.type === 'income'
                  return (
                    <div className="list-item" key={e.id}>
                      <span
                        className="dot"
                        style={{
                          background: catColor(e.categoryId),
                          width: 12,
                          height: 12,
                        }}
                      />
                      <div className="grow">
                        <div>
                          {e.subscriptionId ? '🔁 ' : ''}
                          {income ? e.note || 'Income' : catName(e.categoryId)}
                        </div>
                        {!income && e.note && (
                          <div className="faint" style={{ fontSize: 13 }}>
                            {e.note}
                          </div>
                        )}
                      </div>
                      <span
                        style={{
                          fontWeight: 700,
                          color: income ? 'var(--green)' : 'var(--text)',
                        }}
                      >
                        {income ? '+' : ''}
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
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>

      <YouTubeFamily />

      {adding && (
        <AddEntryModal
          month={month}
          onClose={() => setAdding(false)}
          onAdd={(payload) => {
            addExpense(payload)
            setAdding(false)
          }}
        />
      )}
      {addingSub && (
        <AddSubscriptionModal
          onClose={() => setAddingSub(false)}
          onAdd={(payload) => {
            addSubscription(payload)
            setAddingSub(false)
          }}
        />
      )}
    </>
  )
}

function AddEntryModal({
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
    type?: EntryType
  }) => void
}) {
  const { data } = useStore()
  const defaultDate = monthKey(todayKey()) === month ? todayKey() : `${month}-01`
  const [type, setType] = useState<EntryType>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState(data.categories[0]?.id || 'other')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(defaultDate)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) return
    onAdd({
      amount: amt,
      categoryId: type === 'income' ? 'income' : categoryId,
      date,
      note: note.trim() || undefined,
      type,
    })
  }

  return (
    <Modal title="Add to money" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="segmented" style={{ marginBottom: 16, width: '100%' }}>
          {(['expense', 'income'] as EntryType[]).map((t) => (
            <button
              key={t}
              type="button"
              className={type === t ? 'on' : ''}
              style={{ flex: 1 }}
              onClick={() => setType(t)}
            >
              {t === 'expense' ? 'Expense' : 'Income'}
            </button>
          ))}
        </div>
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
        {type === 'expense' && (
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
        )}
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
          <label>{type === 'income' ? 'Source' : 'Note'} (optional)</label>
          <input
            className="input"
            placeholder={type === 'income' ? 'e.g. salary' : 'e.g. groceries'}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <button className="btn primary block" type="submit">
          Add {type}
        </button>
      </form>
    </Modal>
  )
}

function AddSubscriptionModal({
  onClose,
  onAdd,
}: {
  onClose: () => void
  onAdd: (p: {
    name: string
    amount: number
    categoryId: string
    dayOfMonth: number
  }) => void
}) {
  const { data } = useStore()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState(
    data.categories.find((c) => c.id === 'bills')?.id ||
      data.categories[0]?.id ||
      'other',
  )
  const [day, setDay] = useState('1')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const amt = parseFloat(amount)
    const d = Math.min(28, Math.max(1, parseInt(day) || 1))
    if (!name.trim() || !amt || amt <= 0) return
    onAdd({ name: name.trim(), amount: amt, categoryId, dayOfMonth: d })
  }

  return (
    <Modal title="New subscription / bill" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="field">
          <label>Name</label>
          <input
            className="input"
            placeholder="e.g. Netflix, Rent"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="row">
          <div className="field" style={{ flex: 1 }}>
            <label>Amount / month</label>
            <input
              className="input"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="field" style={{ width: 110 }}>
            <label>Day (1–28)</label>
            <input
              className="input"
              type="number"
              min="1"
              max="28"
              value={day}
              onChange={(e) => setDay(e.target.value)}
            />
          </div>
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
          Add subscription
        </button>
      </form>
    </Modal>
  )
}
