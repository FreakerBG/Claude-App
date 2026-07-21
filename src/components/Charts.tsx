// Lightweight, dependency-free SVG charts.

export interface Slice {
  label: string
  value: number
  color: string
}

interface DonutProps {
  slices: Slice[]
  size?: number
  thickness?: number
  centerLabel?: string
  centerSub?: string
}

export function Donut({
  slices,
  size = 160,
  thickness = 22,
  centerLabel,
  centerSub,
}: DonutProps) {
  const total = slices.reduce((s, x) => s + x.value, 0)
  const r = (size - thickness) / 2
  const cx = size / 2
  const cy = size / 2
  const circ = 2 * Math.PI * r

  let offset = 0
  const segments =
    total > 0
      ? slices
          .filter((s) => s.value > 0)
          .map((s) => {
            const frac = s.value / total
            const seg = {
              color: s.color,
              dash: frac * circ,
              gap: circ - frac * circ,
              offset: -offset * circ,
            }
            offset += frac
            return seg
          })
      : []

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="var(--surface-2)"
        strokeWidth={thickness}
      />
      {segments.map((seg, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={seg.color}
          strokeWidth={thickness}
          strokeDasharray={`${seg.dash} ${seg.gap}`}
          strokeDashoffset={seg.offset}
          transform={`rotate(-90 ${cx} ${cy})`}
          strokeLinecap="butt"
        />
      ))}
      {centerLabel && (
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          fontSize={size * 0.15}
          fontWeight={800}
          fill="var(--text)"
        >
          {centerLabel}
        </text>
      )}
      {centerSub && (
        <text
          x={cx}
          y={cy + size * 0.13}
          textAnchor="middle"
          fontSize={size * 0.08}
          fill="var(--text-dim)"
        >
          {centerSub}
        </text>
      )}
    </svg>
  )
}

export interface Bar {
  label: string
  value: number
  highlight?: boolean
}

export function Bars({
  bars,
  height = 120,
  format,
}: {
  bars: Bar[]
  height?: number
  format?: (v: number) => string
}) {
  const max = Math.max(1, ...bars.map((b) => b.value))
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height }}>
      {bars.map((b, i) => {
        const h = (b.value / max) * (height - 26)
        return (
          <div
            key={i}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
              minWidth: 0,
            }}
          >
            <div
              style={{ fontSize: 10, color: 'var(--text-faint)', height: 12 }}
            >
              {b.value > 0 && format ? format(b.value) : ''}
            </div>
            <div
              title={format ? format(b.value) : String(b.value)}
              style={{
                width: '70%',
                maxWidth: 34,
                height: Math.max(3, h),
                borderRadius: 6,
                background: b.highlight ? 'var(--brand)' : 'var(--brand-soft)',
                transition: 'height 0.3s',
              }}
            />
            <div
              style={{
                fontSize: 11,
                color: 'var(--text-dim)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%',
              }}
            >
              {b.label}
            </div>
          </div>
        )
      })}
    </div>
  )
}
