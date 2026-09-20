import { AMPEL_COLORS } from '../data/emotions'

// 3 Kreise (grün/gelb/rot) zur Selbsteinschätzung – auf dem Profil (Status,
// Avatar-Kopf) und im "eigene Emotion"-Formular verwendet.
export default function AmpelCircles({ options, selected, onSelect, size = 22 }) {
  return (
    <div className="fm-ampel-circles">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          className={`fm-ampel-circle ${selected === o.id ? 'is-active' : ''}`}
          style={{ width: size, height: size, background: AMPEL_COLORS[o.id], color: AMPEL_COLORS[o.id] }}
          onClick={() => onSelect?.(o.id)}
          aria-label={o.label ?? o.id}
          disabled={!onSelect}
        />
      ))}
    </div>
  )
}
