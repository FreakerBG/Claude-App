// Tiny dependency-free confetti burst. Respects reduced-motion.
export function confettiBurst(x?: number, y?: number): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const colors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6']
  const originX = x ?? window.innerWidth / 2
  const originY = y ?? window.innerHeight / 3
  const count = 26

  const container = document.createElement('div')
  container.style.cssText =
    'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden'
  document.body.appendChild(container)

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div')
    const size = 6 + Math.random() * 6
    const color = colors[(Math.random() * colors.length) | 0]
    const angle = Math.random() * Math.PI * 2
    const velocity = 60 + Math.random() * 120
    const dx = Math.cos(angle) * velocity
    const dy = Math.sin(angle) * velocity - 80
    p.style.cssText = `position:absolute;left:${originX}px;top:${originY}px;width:${size}px;height:${size}px;background:${color};border-radius:${Math.random() > 0.5 ? '50%' : '2px'};opacity:1;will-change:transform,opacity`
    container.appendChild(p)
    const duration = 700 + Math.random() * 600
    p.animate(
      [
        { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
        {
          transform: `translate(${dx}px, ${dy + 220}px) rotate(${
            Math.random() * 720 - 360
          }deg)`,
          opacity: 0,
        },
      ],
      { duration, easing: 'cubic-bezier(.2,.6,.3,1)', fill: 'forwards' },
    )
  }
  setTimeout(() => container.remove(), 1500)
}
