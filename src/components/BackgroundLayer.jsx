import { useLocation } from 'react-router-dom'

// Leicht unterschiedliche Akzentfarben je Bereich der App, damit die fixe
// Hintergrundebene (siehe base.css #fm-bg) nicht auf jeder Seite exakt
// gleich aussieht – Home/Match bleiben warm (Gelb), Freunde/PANAS bekommen
// einen violetten, Profil einen grünen Ton.
const VARIANTS = [
  { test: (p) => p.startsWith('/profile') || p.startsWith('/settings'), primary: 'var(--green)', secondary: 'var(--blue-light)' },
  { test: (p) => p.startsWith('/friends'), primary: 'var(--purple)', secondary: 'var(--red-light)' },
  { test: (p) => p.startsWith('/panas'), primary: 'var(--purple)', secondary: 'var(--yellow-grad-1)' },
  { test: (p) => ['/match', '/search', '/found', '/chat'].includes(p), primary: 'var(--red)', secondary: 'var(--yellow-grad-1)' },
]
const DEFAULT = { primary: 'var(--yellow)', secondary: '#ffd9d0' }

export default function BackgroundLayer() {
  const { pathname } = useLocation()
  const { primary, secondary } = VARIANTS.find((v) => v.test(pathname)) ?? DEFAULT

  return (
    <div id="fm-bg" aria-hidden="true">
      <span className="fm-bg__circle fm-bg__circle--yellow" style={{ background: primary }} />
      <span className="fm-bg__circle fm-bg__circle--pink" style={{ background: secondary }} />
      <span className="fm-bg__grain" />
    </div>
  )
}
