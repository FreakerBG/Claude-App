import { useRef, useState } from 'react'
import { useStore } from '../store/StoreContext'
import { exportData, importData } from '../store/db'
import { CURRENCIES } from '../utils/currency'
import { ThemePref } from '../store/types'

const SWATCHES = [
  '#ef4444', '#f59e0b', '#eab308', '#10b981', '#3b82f6',
  '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6', '#6b7280',
]

export function Settings() {
  const {
    data,
    updateSettings,
    addCategory,
    updateCategory,
    deleteCategory,
    replaceAll,
    clearAll,
  } = useStore()
  const fileRef = useRef<HTMLInputElement>(null)
  const [newCat, setNewCat] = useState('')
  const [newColor, setNewColor] = useState('#6366f1')
  const [importMsg, setImportMsg] = useState('')

  const onImport = async (file?: File) => {
    if (!file) return
    try {
      const incoming = await importData(file)
      if (
        confirm(
          'Importing will replace all current data on this device. Continue?',
        )
      ) {
        replaceAll(incoming)
        setImportMsg('Backup imported ✓')
        setTimeout(() => setImportMsg(''), 2500)
      }
    } catch {
      setImportMsg('Could not read that file.')
      setTimeout(() => setImportMsg(''), 2500)
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Settings</h1>
      </div>

      <div className="card">
        <div className="card-title">Profile</div>
        <div className="field">
          <label>Your name</label>
          <input
            className="input"
            placeholder="Name (for the greeting)"
            value={data.settings.name}
            onChange={(e) => updateSettings({ name: e.target.value })}
          />
        </div>
        <div className="field">
          <label>Currency</label>
          <select
            className="select"
            value={data.settings.currency}
            onChange={(e) => updateSettings({ currency: e.target.value })}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Theme</label>
          <div className="segmented">
            {(['light', 'dark', 'system'] as ThemePref[]).map((t) => (
              <button
                key={t}
                className={data.settings.theme === t ? 'on' : ''}
                onClick={() => updateSettings({ theme: t })}
              >
                {t[0].toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Expense categories</div>
        <div className="list">
          {data.categories.map((c) => (
            <div className="list-item" key={c.id} style={{ flexWrap: 'wrap' }}>
              <input
                type="color"
                value={c.color}
                onChange={(e) => updateCategory(c.id, { color: e.target.value })}
                style={{
                  width: 30,
                  height: 30,
                  border: 'none',
                  background: 'none',
                  padding: 0,
                }}
                aria-label="Color"
              />
              <input
                className="input"
                style={{ flex: 1, minWidth: 120 }}
                value={c.name}
                onChange={(e) => updateCategory(c.id, { name: e.target.value })}
              />
              <input
                className="input"
                type="number"
                inputMode="decimal"
                min="0"
                style={{ width: 100 }}
                placeholder="Budget"
                value={c.monthlyBudget || ''}
                onChange={(e) =>
                  updateCategory(c.id, {
                    monthlyBudget: parseFloat(e.target.value) || 0,
                  })
                }
              />
              <button
                className="icon-btn"
                onClick={() => {
                  if (confirm(`Delete category “${c.name}”?`))
                    deleteCategory(c.id)
                }}
                aria-label="Delete"
              >
                🗑
              </button>
            </div>
          ))}
        </div>

        <div className="row" style={{ marginTop: 14, flexWrap: 'wrap' }}>
          <div className="row" style={{ gap: 6 }}>
            {SWATCHES.map((s) => (
              <button
                key={s}
                onClick={() => setNewColor(s)}
                aria-label={s}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: s,
                  border:
                    newColor === s
                      ? '2px solid var(--text)'
                      : '2px solid transparent',
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
          <input
            className="input"
            style={{ flex: 1, minWidth: 140 }}
            placeholder="New category name"
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
          />
          <button
            className="btn sm"
            disabled={!newCat.trim()}
            onClick={() => {
              addCategory(newCat, newColor)
              setNewCat('')
            }}
          >
            Add
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Backup & restore</div>
        <p className="muted" style={{ marginTop: 0, fontSize: 14 }}>
          Your data lives only on this device. Export a backup file to move it to
          another device (like your phone or PC), then import it there.
        </p>
        <div className="row wrap">
          <button className="btn" onClick={() => exportData(data)}>
            ⬇ Export backup
          </button>
          <button className="btn" onClick={() => fileRef.current?.click()}>
            ⬆ Import backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            style={{ display: 'none' }}
            onChange={(e) => onImport(e.target.files?.[0] || undefined)}
          />
        </div>
        {importMsg && (
          <div className="muted" style={{ marginTop: 10, fontSize: 14 }}>
            {importMsg}
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">Danger zone</div>
        <button
          className="btn danger"
          onClick={() => {
            if (
              confirm(
                'Delete ALL data on this device? This cannot be undone. Consider exporting a backup first.',
              )
            )
              clearAll()
          }}
        >
          🗑 Clear all data
        </button>
      </div>

      <div
        className="faint"
        style={{ textAlign: 'center', fontSize: 12, marginTop: 20 }}
      >
        Momentum · self-improvement tracker
      </div>
    </>
  )
}
