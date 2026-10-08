import { useMemo } from 'react'
import './Confetti.css'

const COLORS = [
  '#DC2626', '#EF4444', '#991B1B', // reds
  '#FBBF24', '#F59E0B',             // golds
  '#FB7185', '#FDBA74',             // coral / peach
  '#FFFFFF',                         // white
]

const SHAPES = ['rect', 'rect', 'rect', 'circle', 'strip'] // weighted toward strips

function rand(min, max) {
  return Math.random() * (max - min) + min
}

export default function Confetti({ count = 70 }) {
  const pieces = useMemo(() => {
    return Array.from({ length: count }, (_, i) => {
      const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)]
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      const left = rand(0, 100)
      const delay = rand(0, 1.2)
      const duration = rand(3.5, 6.5)
      const drift = rand(-80, 80)
      const rotateStart = rand(0, 360)
      const rotateEnd = rotateStart + rand(360, 1080) * (Math.random() > 0.5 ? 1 : -1)
      const size = shape === 'strip' ? rand(6, 10) : rand(7, 12)
      const scale = rand(0.7, 1.3)

      return { i, shape, color, left, delay, duration, drift, rotateStart, rotateEnd, size, scale }
    })
  }, [count])

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.i}
          className={`confetti-piece confetti-${p.shape}`}
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            width: p.shape === 'strip' ? `${p.size * 0.35}px` : `${p.size}px`,
            height: p.shape === 'strip' ? `${p.size * 2.2}px` : `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--drift': `${p.drift}px`,
            '--rot-start': `${p.rotateStart}deg`,
            '--rot-end': `${p.rotateEnd}deg`,
            '--scale': p.scale,
          }}
        />
      ))}
    </div>
  )
}

const SCATTER_COLORS = ['#DC2626', '#EF4444', '#FBBF24', '#FB7185', '#F59E0B']

function Scatter({ positions }) {
  return (
    <div className="confetti-scatter" aria-hidden="true">
      {positions.map((p, i) => (
        <span
          key={i}
          className={`scatter-piece sp-${p.shape}`}
          style={{
            top: p.top,
            left: p.left,
            right: p.right,
            bottom: p.bottom,
            backgroundColor: p.shape !== 'tri' ? SCATTER_COLORS[i % SCATTER_COLORS.length] : undefined,
            borderBottom: p.shape === 'tri' ? `9px solid ${SCATTER_COLORS[i % SCATTER_COLORS.length]}` : undefined,
            transform: `rotate(${p.rot}deg)`,
            animationDelay: `${p.delay}s`,
            '--sr': `${p.rot}deg`,
          }}
        />
      ))}
    </div>
  )
}

export { Scatter }
