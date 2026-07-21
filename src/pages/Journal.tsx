import { useEffect, useState } from 'react'
import { useStore } from '../store/StoreContext'
import { formatDayLabel, formatFullDate, todayKey } from '../utils/dates'
import { ACTIVITY_TAGS } from '../store/types'

export const MOODS = ['😞', '😕', '😐', '🙂', '😄']

export function Journal() {
  const { data, saveJournal, deleteJournal } = useStore()
  const [day, setDay] = useState(todayKey())
  const [mood, setMood] = useState(3)
  const [text, setText] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [savedFlash, setSavedFlash] = useState(false)

  // Load the entry for the selected day whenever it changes.
  useEffect(() => {
    const entry = data.journal.find((j) => j.date === day)
    setMood(entry?.mood ?? 3)
    setText(entry?.text ?? '')
    setTags(entry?.tags ?? [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day])

  const toggleTag = (id: string) =>
    setTags((t) => (t.includes(id) ? t.filter((x) => x !== id) : [...t, id]))

  const save = () => {
    saveJournal(day, mood, text.trim(), tags)
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 1400)
  }

  const past = [...data.journal].sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Journal</h1>
          <div className="sub">How was your {day === todayKey() ? 'day' : 'day'}?</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">{formatDayLabel(day)}</div>

        <div className="field">
          <label>Mood</label>
          <div className="mood-scale">
            {MOODS.map((m, i) => (
              <button
                key={m}
                className={'mood-btn' + (mood === i + 1 ? ' on' : '')}
                onClick={() => setMood(i + 1)}
                type="button"
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>What did you do?</label>
          <div className="tag-wrap">
            {ACTIVITY_TAGS.map((t) => (
              <button
                key={t.id}
                type="button"
                className={'tag-chip' + (tags.includes(t.id) ? ' on' : '')}
                onClick={() => toggleTag(t.id)}
              >
                <span>{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label>Notes</label>
          <textarea
            className="textarea"
            placeholder="What happened, what you're grateful for, what you learned…"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <button className="btn primary block" onClick={save}>
          {savedFlash ? 'Saved ✓' : 'Save entry'}
        </button>
      </div>

      <div className="card">
        <div className="card-title">Past entries</div>
        {past.length === 0 ? (
          <div className="empty">
            <div className="emoji">📓</div>
            No entries yet. Write your first above.
          </div>
        ) : (
          <div className="list">
            {past.map((j) => (
              <div className="list-item" key={j.id}>
                <span style={{ fontSize: 22 }}>{MOODS[j.mood - 1]}</span>
                <div
                  className="grow"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setDay(j.date)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{formatFullDate(j.date)}</div>
                  {j.text && (
                    <div className="faint truncate" style={{ fontSize: 13 }}>
                      {j.text}
                    </div>
                  )}
                </div>
                <button
                  className="icon-btn"
                  onClick={() => {
                    if (confirm('Delete this entry?')) deleteJournal(j.id)
                  }}
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
