import { useMemo } from 'react'
import { useStore } from '../store/StoreContext'
import { Bars } from '../components/Charts'
import { formatMoney } from '../utils/currency'
import { monthKey, todayKey } from '../utils/dates'
import { computeMomentum } from '../utils/gamification'
import {
  habitStats,
  moodByDate,
  moodCorrelations,
  spendTrend,
} from '../utils/insights'
import { MOODS } from './Journal'

const MOOD_COLORS = ['#ef4444', '#f59e0b', '#a3a3a3', '#34d399', '#10b981']
const MONTHS_1 = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

export function Insights() {
  const { data } = useStore()
  const currency = data.settings.currency
  const today = todayKey()

  const momentum = useMemo(() => computeMomentum(data), [data])
  const spend = useMemo(
    () => spendTrend(data, 6, monthKey(today)),
    [data, today],
  )
  const hStats = useMemo(() => habitStats(data, 30), [data])
  const correlations = useMemo(() => moodCorrelations(data), [data])
  const moods = useMemo(() => moodByDate(data), [data])

  const year = Number(today.slice(0, 4))
  const avgMood = useMemo(() => {
    const vals = Object.values(moods)
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0
  }, [moods])

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Insights</h1>
          <div className="sub">Your patterns and progress</div>
        </div>
      </div>

      {/* Momentum */}
      <div className="card">
        <div className="card-title">Momentum</div>
        <div className="row" style={{ gap: 16 }}>
          <div
            className="level-ring"
            style={{ ['--p' as string]: Math.round(momentum.progress * 100) }}
          >
            <div className="inner">
              <span className="lvl">{momentum.level}</span>
              <span className="cap">Level</span>
            </div>
          </div>
          <div className="grow">
            <div style={{ fontWeight: 800, fontSize: 18 }}>
              {momentum.levelName}
            </div>
            <div className="muted" style={{ fontSize: 14 }}>
              {momentum.score.toLocaleString()} pts ·{' '}
              {momentum.levelSpan - momentum.intoLevel} to level{' '}
              {momentum.level + 1}
            </div>
            <div className="progress" style={{ marginTop: 8 }}>
              <span style={{ width: `${momentum.progress * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="card">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <div className="card-title" style={{ margin: 0 }}>
            Achievements
          </div>
          <span className="faint" style={{ fontSize: 13 }}>
            {momentum.earnedCount}/{momentum.badges.length}
          </span>
        </div>
        <div className="badge-grid" style={{ marginTop: 12 }}>
          {momentum.badges.map((b) => (
            <div key={b.id} className={'badge' + (b.earned ? '' : ' locked')}>
              <div className="b-emoji">{b.emoji}</div>
              <div className="b-label">{b.label}</div>
              <div className="b-desc">{b.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Spending trend */}
      <div className="card">
        <div className="card-title">Spending — last 6 months</div>
        {spend.every((s) => s.value === 0) ? (
          <div className="faint" style={{ fontSize: 14 }}>
            No spending logged yet.
          </div>
        ) : (
          <Bars
            bars={spend.map((s, i) => ({
              ...s,
              highlight: i === spend.length - 1,
            }))}
            height={140}
            format={(v) => formatMoney(v, currency).replace(/\.\d+$/, '')}
          />
        )}
      </div>

      {/* Habit completion */}
      {data.habits.length > 0 && (
        <div className="card">
          <div className="card-title">Habit completion — last 30 days</div>
          <div className="stat-row" style={{ marginBottom: 12 }}>
            <span className="stat-big">{Math.round(hStats.rate * 100)}%</span>
            <span className="muted">overall</span>
          </div>
          <div className="list">
            {hStats.perHabit.map((h, i) => (
              <div key={i} style={{ padding: '7px 0' }}>
                <div
                  className="row"
                  style={{ justifyContent: 'space-between', marginBottom: 5 }}
                >
                  <span className="muted truncate">
                    {h.emoji ? h.emoji + ' ' : ''}
                    {h.name}
                  </span>
                  <span className="faint" style={{ fontSize: 13 }}>
                    {Math.round(h.rate * 100)}%
                  </span>
                </div>
                <div className="progress">
                  <span style={{ width: `${h.rate * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mood correlations */}
      {correlations.length > 0 && (
        <div className="card">
          <div className="card-title">What lifts your mood</div>
          <div className="list">
            {correlations.map((c) => (
              <div className="corr" key={c.label}>
                <span className="c-emoji">{c.emoji}</span>
                <div className="grow">
                  <div style={{ fontWeight: 600 }}>
                    On days {c.label}
                  </div>
                  <div className="faint" style={{ fontSize: 12 }}>
                    avg mood {c.on.toFixed(1)} vs {c.off.toFixed(1)} otherwise
                  </div>
                </div>
                <span
                  className="c-delta"
                  style={{
                    color: c.delta >= 0 ? 'var(--green)' : 'var(--red)',
                  }}
                >
                  {c.delta >= 0 ? '+' : ''}
                  {c.delta.toFixed(1)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Year in pixels */}
      {Object.keys(moods).length > 0 && (
        <div className="card">
          <div className="row" style={{ justifyContent: 'space-between' }}>
            <div className="card-title" style={{ margin: 0 }}>
              Year in pixels · {year}
            </div>
            <span className="faint" style={{ fontSize: 13 }}>
              avg {avgMood.toFixed(1)} {MOODS[Math.round(avgMood) - 1] || ''}
            </span>
          </div>
          <div className="pixels" style={{ marginTop: 12 }}>
            <span />
            {MONTHS_1.map((m, i) => (
              <span className="pmonth" key={i}>
                {m}
              </span>
            ))}
            {Array.from({ length: 31 }, (_, d) => {
              const day = d + 1
              return [
                <span className="pday-label" key={`l${day}`}>
                  {day % 5 === 0 || day === 1 ? day : ''}
                </span>,
                ...Array.from({ length: 12 }, (_, mo) => {
                  const key = `${year}-${String(mo + 1).padStart(2, '0')}-${String(
                    day,
                  ).padStart(2, '0')}`
                  const mood = moods[key]
                  return (
                    <span
                      className="pcell"
                      key={key}
                      title={mood ? `${key}: ${MOODS[mood - 1]}` : key}
                      style={
                        mood
                          ? { background: MOOD_COLORS[mood - 1] }
                          : undefined
                      }
                    />
                  )
                }),
              ]
            })}
          </div>
        </div>
      )}
    </>
  )
}
