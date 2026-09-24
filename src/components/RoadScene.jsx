/* Ilustração vetorial da mesma rua em dois estados. É desenho, não foto:
   serve para explicar a proposta de calçamento, não para simular um "antes e depois" real. */

const W = 800
const H = 460
const HORIZON = 168
const ROWS = 16
const COLS = 9

/* meia-largura da via em cada altura y (perspectiva) */
const halfWidth = (y) => {
  const t = (y - HORIZON) / (H - HORIZON)
  return 46 + 430 * Math.pow(t, 1.22)
}

const rowY = (i) => HORIZON + (H - HORIZON) * Math.pow(i / ROWS, 1.75)

function SkyAndSurroundings() {
  return (
    <>
      <rect x="0" y="0" width={W} height={HORIZON + 6} fill="url(#skyGrad)" />
      {/* linha do horizonte / arvoredo */}
      <path
        d="M0 168 L0 140 Q40 118 78 138 Q104 108 140 132 Q176 104 212 134 Q252 110 292 136 Q330 116 372 138 Q412 112 452 136 Q494 110 534 134 Q574 108 614 132 Q652 112 692 136 Q730 116 800 140 L800 168 Z"
        fill="#3f8f4e"
        opacity="0.95"
      />
      {/* casas ao fundo */}
      <g fill="#f1dfbd" opacity="0.95">
        <path d="M120 168 L120 128 L152 108 L184 128 L184 168 Z" />
        <path d="M228 168 L228 134 L256 116 L284 134 L284 168 Z" />
        <path d="M520 168 L520 130 L550 110 L580 130 L580 168 Z" />
        <path d="M626 168 L626 136 L652 118 L678 136 L678 168 Z" />
      </g>
      {/* gramado */}
      <rect x="0" y={HORIZON} width={W} height={H - HORIZON} fill="url(#grassGrad)" />
    </>
  )
}

function RoadPolygon({ fill }) {
  const yTop = HORIZON
  const yBot = H
  const topHalf = halfWidth(yTop + 1)
  const botHalf = halfWidth(yBot)
  return (
    <path
      d={`M${W / 2 - topHalf} ${yTop} L${W / 2 + topHalf} ${yTop} L${W / 2 + botHalf} ${yBot} L${W / 2 - botHalf} ${yBot} Z`}
      fill={fill}
    />
  )
}

/* ---------------- ANTES: rua de terra com buracos e poeira ---------------- */
export function RoadBefore() {
  const potholes = [
    { x: 300, y: 250, rx: 34, ry: 11 },
    { x: 470, y: 300, rx: 46, ry: 15 },
    { x: 250, y: 360, rx: 62, ry: 20 },
    { x: 560, y: 415, rx: 74, ry: 24 },
    { x: 398, y: 205, rx: 22, ry: 7 },
    { x: 148, y: 430, rx: 56, ry: 18 },
  ]

  const ruts = [-0.34, 0.34]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="h-full w-full" role="img" aria-label="Ilustração: rua de terra com buracos e poeira">
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4aa8f5" />
          <stop offset="100%" stopColor="#cfeaff" />
        </linearGradient>
        <linearGradient id="grassGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5bb85f" />
          <stop offset="100%" stopColor="#3f9a4a" />
        </linearGradient>
        <linearGradient id="dirtGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8d7a5e" />
          <stop offset="55%" stopColor="#a08b69" />
          <stop offset="100%" stopColor="#b49b76" />
        </linearGradient>
        <radialGradient id="dustGrad" cx="50%" cy="60%" r="55%">
          <stop offset="0%" stopColor="#e6d7bd" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#e6d7bd" stopOpacity="0" />
        </radialGradient>
      </defs>

      <SkyAndSurroundings />
      <RoadPolygon fill="url(#dirtGrad)" />

      {/* sulcos de pneu */}
      {ruts.map((k, i) => (
        <path
          key={i}
          d={`M${W / 2 + k * halfWidth(HORIZON + 2)} ${HORIZON + 2} L${W / 2 + k * halfWidth(H)} ${H}`}
          stroke="#7b6a50"
          strokeWidth="16"
          strokeLinecap="round"
          opacity="0.55"
        />
      ))}

      {/* buracos */}
      {potholes.map((p, i) => (
        <g key={i}>
          <ellipse cx={p.x} cy={p.y + p.ry * 0.28} rx={p.rx} ry={p.ry} fill="#c9b28c" opacity="0.55" />
          <ellipse cx={p.x} cy={p.y} rx={p.rx} ry={p.ry} fill="#3b2f1f" />
          <ellipse cx={p.x} cy={p.y - p.ry * 0.22} rx={p.rx * 0.78} ry={p.ry * 0.62} fill="#241c11" />
        </g>
      ))}

      {/* poeira suspensa */}
      <ellipse cx="520" cy="300" rx="230" ry="88" fill="url(#dustGrad)" />
      <ellipse cx="230" cy="380" rx="200" ry="76" fill="url(#dustGrad)" />

      {/* pedras soltas */}
      <g fill="#6f5f47" opacity="0.75">
        <circle cx="360" cy="330" r="3.4" />
        <circle cx="430" cy="368" r="4.2" />
        <circle cx="300" cy="410" r="5" />
        <circle cx="600" cy="352" r="3.8" />
        <circle cx="520" cy="248" r="2.6" />
      </g>
    </svg>
  )
}

/* ---------------- DEPOIS: rua calçada com bloco intertravado ---------------- */
export function RoadAfter() {
  const rows = []
  for (let i = 0; i < ROWS; i++) {
    const yA = rowY(i)
    const yB = rowY(i + 1)
    const hwA = halfWidth(yA)
    const hwB = halfWidth(yB)
    const offset = i % 2 === 0 ? 0 : 0.5
    const blocks = []
    for (let c = -COLS; c < COLS; c++) {
      const t0 = (c + offset) / COLS
      const t1 = (c + 1 + offset) / COLS
      if (t1 < -1.02 || t0 > 1.02) continue
      const a0 = Math.max(-1, t0)
      const a1 = Math.min(1, t1)
      blocks.push(
        <path
          key={`${i}-${c}`}
          d={`M${W / 2 + a0 * hwA} ${yA} L${W / 2 + a1 * hwA} ${yA} L${W / 2 + a1 * hwB} ${yB} L${W / 2 + a0 * hwB} ${yB} Z`}
          fill={(i + c) % 3 === 0 ? '#b9b9b1' : (i + c) % 3 === 1 ? '#adada5' : '#c2c2ba'}
          stroke="#8e8e86"
          strokeWidth="0.9"
        />,
      )
    }
    rows.push(<g key={i}>{blocks}</g>)
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="h-full w-full" role="img" aria-label="Ilustração: a mesma rua com calçamento de bloco intertravado">
      <defs>
        <linearGradient id="skyGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4aa8f5" />
          <stop offset="100%" stopColor="#cfeaff" />
        </linearGradient>
        <linearGradient id="grassGrad2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#62c066" />
          <stop offset="100%" stopColor="#43a04e" />
        </linearGradient>
        <linearGradient id="paverShade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a1730" stopOpacity="0.18" />
          <stop offset="45%" stopColor="#0a1730" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g>
        <rect x="0" y="0" width={W} height={HORIZON + 6} fill="url(#skyGrad2)" />
        <path
          d="M0 168 L0 140 Q40 118 78 138 Q104 108 140 132 Q176 104 212 134 Q252 110 292 136 Q330 116 372 138 Q412 112 452 136 Q494 110 534 134 Q574 108 614 132 Q652 112 692 136 Q730 116 800 140 L800 168 Z"
          fill="#3f8f4e"
          opacity="0.95"
        />
        <g fill="#f1dfbd" opacity="0.95">
          <path d="M120 168 L120 128 L152 108 L184 128 L184 168 Z" />
          <path d="M228 168 L228 134 L256 116 L284 134 L284 168 Z" />
          <path d="M520 168 L520 130 L550 110 L580 130 L580 168 Z" />
          <path d="M626 168 L626 136 L652 118 L678 136 L678 168 Z" />
        </g>
        <rect x="0" y={HORIZON} width={W} height={H - HORIZON} fill="url(#grassGrad2)" />
      </g>

      {rows}

      {/* meio-fio */}
      <path
        d={`M${W / 2 - halfWidth(HORIZON + 2)} ${HORIZON} L${W / 2 - halfWidth(H)} ${H} L${W / 2 - halfWidth(H) - 26} ${H} L${W / 2 - halfWidth(HORIZON + 2) - 5} ${HORIZON} Z`}
        fill="#dcdcd4"
        opacity="0.9"
      />
      <path
        d={`M${W / 2 + halfWidth(HORIZON + 2)} ${HORIZON} L${W / 2 + halfWidth(H)} ${H} L${W / 2 + halfWidth(H) + 26} ${H} L${W / 2 + halfWidth(HORIZON + 2) + 5} ${HORIZON} Z`}
        fill="#dcdcd4"
        opacity="0.9"
      />

      {/* poste de luz */}
      <g>
        <rect x="662" y="150" width="6" height="176" fill="#0f2247" />
        <path d="M665 152 Q665 132 700 132" stroke="#0f2247" strokeWidth="6" fill="none" />
        <circle cx="702" cy="134" r="9" fill="#ffcc00" opacity="0.95" />
        <circle cx="702" cy="134" r="20" fill="#ffcc00" opacity="0.18" />
      </g>

      <rect x="0" y={HORIZON} width={W} height={H - HORIZON} fill="url(#paverShade)" />
    </svg>
  )
}
