// Zeigt das gewählte Profilbild (siehe data/avatars.js), oder – falls keins
// gesetzt ist – den ersten Buchstaben des Anzeigenamens als Fallback.
// children (z.B. ein Ampel-Punkt) werden über das Bild gelegt.
export default function AvatarCircle({
  avatarUrl,
  name,
  size = 52,
  background = 'var(--surface-muted)',
  className = '',
  style,
  children,
}) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        background: avatarUrl ? 'transparent' : background,
        fontWeight: 800,
        color: 'var(--text)',
        flexShrink: 0,
        ...style,
      }}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
      ) : (
        name?.slice(0, 1).toUpperCase()
      )}
      {children}
    </div>
  )
}
