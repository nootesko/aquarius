import { useRef } from 'react'
import { motion, useMotionTemplate, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'

/* O gesto central da campanha: um buraco que vai sendo preenchido com
   blocos de calçamento conforme o morador rola a página. */
export function PotholeFill({ className = '', rimColor = '#2a3550', ringColor = 'var(--color-gold-400)' }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.9', 'end 0.35'] })
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 0.001 })

  const fillTop = useTransform(p, [0.02, 0.8], [94, 0])
  const fillClip = useMotionTemplate`inset(${fillTop}% 0 0 0)`
  const shadowOpacity = useTransform(p, [0.05, 0.9], [0.42, 0.04])
  const glow = useTransform(p, [0.6, 1], [0, 1])

  const rows = []
  const COLS = 7
  const ROWS = 5
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const w = 300 / COLS
      const h = 150 / ROWS
      const offset = r % 2 ? w / 2 : 0
      rows.push(
        <rect
          key={`${r}-${c}`}
          x={c * w + offset - w / 2}
          y={r * h}
          width={w - 2}
          height={h - 2}
          rx="3"
          fill={(r + c) % 3 === 0 ? '#c7c7bf' : (r + c) % 3 === 1 ? '#b6b6ae' : '#d2d2ca'}
          stroke="#8e8e86"
          strokeWidth="1"
        />,
      )
    }
  }

  return (
    <div ref={ref} className={className}>
      <svg viewBox="0 0 300 150" className="h-full w-full overflow-visible" aria-hidden="true">
        <defs>
          <clipPath id="hole-clip">
            <path d="M18 74 C22 40 62 18 108 14 C152 10 196 16 240 28 C272 37 288 54 284 76 C280 100 252 120 208 132 C160 145 104 146 62 132 C28 121 14 100 18 74 Z" />
          </clipPath>
          <linearGradient id="holeDepth" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#050d1e" />
            <stop offset="55%" stopColor="#0a1730" />
            <stop offset="100%" stopColor="#1d3d78" />
          </linearGradient>
        </defs>

        {/* borda de asfalto lascada em volta */}
        <path
          d="M18 74 C22 40 62 18 108 14 C152 10 196 16 240 28 C272 37 288 54 284 76 C280 100 252 120 208 132 C160 145 104 146 62 132 C28 121 14 100 18 74 Z"
          fill="none"
          stroke={rimColor}
          strokeWidth="10"
          strokeLinejoin="round"
        />

        <g clipPath="url(#hole-clip)">
          {/* profundidade do buraco */}
          <rect x="0" y="0" width="300" height="150" fill="url(#holeDepth)" />
          {/* pedras soltas no fundo do buraco */}
          <g fill="#39435a" opacity="0.55">
            <circle cx="86" cy="96" r="6" />
            <circle cx="176" cy="72" r="4.5" />
            <circle cx="216" cy="108" r="7" />
            <circle cx="128" cy="46" r="3.5" />
          </g>
          <motion.rect
            x="0"
            y="0"
            width="300"
            height="150"
            fill="#000"
            style={reduce ? undefined : { opacity: shadowOpacity }}
          />

          {/* calçamento entrando de baixo para cima */}
          <motion.g style={reduce ? { clipPath: 'inset(0% 0 0 0)' } : { clipPath: fillClip }}>{rows}</motion.g>
        </g>

        {/* brilho de "concluído" */}
        <motion.path
          d="M18 74 C22 40 62 18 108 14 C152 10 196 16 240 28 C272 37 288 54 284 76 C280 100 252 120 208 132 C160 145 104 146 62 132 C28 121 14 100 18 74 Z"
          fill="none"
          stroke={ringColor}
          strokeWidth="3"
          style={reduce ? { opacity: 1 } : { opacity: glow }}
        />
      </svg>
    </div>
  )
}
