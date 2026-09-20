import { AMPEL_COLORS } from '../data/emotions'

const ORDER = ['red', 'yellow', 'green']

// Kompaktes Ampel-Symbol (dunkles Gehäuse + 3 gestapelte Lichter) statt
// eines einzelnen Farbpunkts, damit der Status einer Person auf einen Blick
// als Ampel erkennbar ist – nur die aktuelle Farbe leuchtet, die anderen
// beiden bleiben gedimmt, wie bei einer echten Verkehrsampel.
export default function TrafficLight({ active, size = 8, className = '' }) {
  return (
    <div
      className={`fm-traffic-light ${className}`}
      style={{ gap: Math.round(size * 0.35), padding: Math.round(size * 0.35) }}
    >
      {ORDER.map((color) => (
        <span
          key={color}
          className="fm-traffic-light__dot"
          style={{
            width: size,
            height: size,
            background: AMPEL_COLORS[color],
            opacity: active === color ? 1 : 0.25,
            boxShadow: active === color ? `0 0 ${size}px ${AMPEL_COLORS[color]}` : 'none',
          }}
        />
      ))}
    </div>
  )
}
