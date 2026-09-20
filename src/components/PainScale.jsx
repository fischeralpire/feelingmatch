// Schmerz-/Belastungsskala 1-6 zum Antippen (statt Schieberegler) – auf dem
// Profil und optional im täglichen Stimmungs-Check-in verwendet. `fullWidth`
// lässt die 6 Kreise die volle Breite des Elternelements ausfüllen (Profil,
// auf Höhe des "Status speichern"-Buttons), sonst feste Kreisgröße.
export default function PainScale({ value, onSelect, size = 38, fullWidth = false }) {
  return (
    <div className={`fm-pain-scale ${fullWidth ? 'fm-pain-scale--full' : ''}`}>
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <button
          key={n}
          type="button"
          className={`fm-pain-scale__btn ${value === n ? 'is-active' : ''}`}
          style={fullWidth ? undefined : { width: size, height: size }}
          onClick={() => onSelect(value === n ? null : n)}
        >
          {n}
        </button>
      ))}
    </div>
  )
}
