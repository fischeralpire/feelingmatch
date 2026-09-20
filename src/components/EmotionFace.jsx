// Rundes Gefühls-Icon (Emoji auf Farbfläche). Emojis sind hier bewusstes
// Ausdrucksmittel für Emotionen, keine UI-Icons – siehe README.
export default function EmotionFace({ emoji, background, size = 44, fontSize, style, ...props }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'grid',
        placeItems: 'center',
        fontSize: fontSize ?? size * 0.5,
        background,
        boxShadow: 'inset 0 -8px 15px rgba(0,0,0,0.1)',
        flexShrink: 0,
        ...style,
      }}
      {...props}
    >
      {emoji}
    </div>
  )
}
