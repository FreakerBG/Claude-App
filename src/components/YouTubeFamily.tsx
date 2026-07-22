import { useState } from 'react'
import { useStore } from '../store/StoreContext'
import { uid } from '../store/db'

const MO = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
const MO_FULL = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export function YouTubeFamily() {
  const { data, toggleYtPaid, updateYtFamily } = useStore()
  const yt = data.ytFamily
  const [toast, setToast] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)

  const now = new Date()
  const curY = now.getFullYear()
  const curM = now.getMonth()

  const isPaid = (id: string, y: number, m: number) =>
    !!yt.paid[id]?.[`${y}-${m}`]
  const isPastOrCurrent = (y: number, m: number) =>
    y < curY || (y === curY && m <= curM)
  const isCurrent = (y: number, m: number) => y === curY && m === curM
  const isPast = (y: number, m: number) =>
    y < curY || (y === curY && m < curM)

  const owedMonths = (id: string) => {
    let n = 0
    for (const y of yt.years)
      for (let m = 0; m < 12; m++)
        if (isPastOrCurrent(y, m) && !isPaid(id, y, m)) n++
    return n
  }

  const totalOwed = yt.members.reduce(
    (s, mem) => s + owedMonths(mem.id) * yt.price,
    0,
  )

  const tap = (id: string, name: string, y: number, m: number) => {
    const was = isPaid(id, y, m)
    toggleYtPaid(id, y, m)
    setToast(`${name} · ${MO_FULL[m]} ${y} ${was ? '—' : '✓'}`)
    window.clearTimeout((tap as any)._t)
    ;(tap as any)._t = window.setTimeout(() => setToast(null), 1600)
  }

  // ----- edit helpers -----
  const setMember = (id: string, patch: { name?: string; initials?: string }) =>
    updateYtFamily({
      members: yt.members.map((mem) =>
        mem.id === id ? { ...mem, ...patch } : mem,
      ),
    })
  const addMember = () =>
    updateYtFamily({
      members: [...yt.members, { id: uid(), name: 'New member', initials: 'N' }],
    })
  const removeMember = (id: string) => {
    const paid = { ...yt.paid }
    delete paid[id]
    updateYtFamily({
      members: yt.members.filter((m) => m.id !== id),
      paid,
    })
  }

  return (
    <div className="card">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div className="row" style={{ gap: 10 }}>
          <span className="yt-logo">▶</span>
          <div>
            <div style={{ fontWeight: 800 }}>YouTube Family</div>
            <div className="faint" style={{ fontSize: 12 }}>
              {yt.price}
              {yt.symbol} / person / month
            </div>
          </div>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: totalOwed > 0 ? 'var(--red)' : 'var(--green)',
              }}
            >
              {totalOwed}
              {yt.symbol}
            </div>
            <div className="faint" style={{ fontSize: 10 }}>
              owed
            </div>
          </div>
          <button
            className="icon-btn"
            onClick={() => setEditing((e) => !e)}
            aria-label="Edit"
          >
            {editing ? '✓' : '✎'}
          </button>
        </div>
      </div>

      {editing && (
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: '1px solid var(--border)',
          }}
        >
          <div className="field" style={{ marginBottom: 10 }}>
            <label>Price per person / month</label>
            <div className="row">
              <input
                className="input"
                type="number"
                min="0"
                step="0.5"
                style={{ width: 110 }}
                value={yt.price}
                onChange={(e) =>
                  updateYtFamily({ price: parseFloat(e.target.value) || 0 })
                }
              />
              <input
                className="input"
                style={{ width: 70 }}
                value={yt.symbol}
                onChange={(e) => updateYtFamily({ symbol: e.target.value })}
                aria-label="Currency symbol"
              />
            </div>
          </div>
          <label className="field" style={{ display: 'block', marginBottom: 6 }}>
            Members
          </label>
          {yt.members.map((mem) => (
            <div className="row" key={mem.id} style={{ marginBottom: 8 }}>
              <input
                className="input"
                style={{ width: 56 }}
                value={mem.initials}
                maxLength={3}
                onChange={(e) => setMember(mem.id, { initials: e.target.value })}
                aria-label="Initials"
              />
              <input
                className="input"
                style={{ flex: 1 }}
                value={mem.name}
                onChange={(e) => setMember(mem.id, { name: e.target.value })}
              />
              <button
                className="icon-btn"
                onClick={() => {
                  if (confirm(`Remove ${mem.name}?`)) removeMember(mem.id)
                }}
                aria-label="Remove"
              >
                🗑
              </button>
            </div>
          ))}
          <button className="btn sm" onClick={addMember}>
            + Add member
          </button>
        </div>
      )}

      {!editing &&
        yt.members.map((mem) => {
          const owed = owedMonths(mem.id)
          return (
            <div className="yt-member" key={mem.id}>
              <div className="yt-member-head">
                <span className="yt-avatar">{mem.initials}</span>
                <span style={{ flex: 1, fontWeight: 600 }}>{mem.name}</span>
                {owed > 0 ? (
                  <span className="yt-owed due">
                    {owed * yt.price}
                    {yt.symbol}
                  </span>
                ) : (
                  <span className="yt-owed clear">✓</span>
                )}
              </div>
              {yt.years.map((y) => (
                <div className="yt-year" key={y}>
                  <div className="yt-year-label">{y}</div>
                  <div className="yt-grid">
                    {Array.from({ length: 12 }, (_, m) => {
                      const p = isPaid(mem.id, y, m)
                      const cls = p
                        ? 'paid'
                        : isCurrent(y, m)
                          ? 'current'
                          : isPast(y, m)
                            ? 'past'
                            : 'future'
                      return (
                        <button
                          key={m}
                          className={`yt-cell ${cls}`}
                          onClick={() => tap(mem.id, mem.name, y, m)}
                        >
                          <span className="yt-mo">{MO[m]}</span>
                          <span className="yt-mk">
                            {p ? '✓' : isPast(y, m) ? '×' : '·'}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )
        })}

      {toast && <div className="yt-toast">{toast}</div>}
    </div>
  )
}
