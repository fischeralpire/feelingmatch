import { useEffect, useRef, useState } from 'react'
import './BlobCharacters.css'

// Reine CSS-Maskottchen (keine Emojis/Bilder) – das visuelle Markenzeichen
// der App aus dem Original-Design. variant steuert Größe/Anordnung.
// mouth: 'none' | 'smile' | 'flat' | 'frown' | 'hidden' | 'o' (alles außer
// 'smile' bekommt zusätzlich einen Lächeln-Overlay, der beim Reiben/Antippen
// sanft eingeblendet wird – siehe --happy in BlobCharacters.css).
// openEyes: geschlossene Bogen-Augen (Splash/Login, unverändertes Original)
// vs. offene Augen mit Pupille + Augenbraue (Home, angelehnt an esta.jpeg).
function Blob({ name, eyes = true, mouth = 'none', headphones = false, wink = false, arms = false, openEyes = false }) {
  const [pressed, setPressed] = useState(false)
  const [happy, setHappy] = useState(0)
  const happyRef = useRef(0)
  const pressedRef = useRef(false)
  pressedRef.current = pressed

  useEffect(() => {
    let raf
    let last = performance.now()
    function loop(now) {
      const dt = now - last
      last = now
      // Beim Reiben wird's über ~900ms glücklich, beim Loslassen klingt
      // es über ~400ms wieder ab – daher fühlt es sich "immer mehr" an.
      const rate = pressedRef.current ? 1 / 900 : -1 / 400
      const next = Math.min(1, Math.max(0, happyRef.current + rate * dt))
      happyRef.current = next
      setHappy(next)
      if (pressedRef.current || next > 0) raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [pressed])

  return (
    <div
      className={`fm-blob-wrap fm-blob-wrap--${name} ${pressed ? 'is-active' : ''}`}
      style={{ '--happy': happy }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
    >
      <div className={`fm-blob-shape fm-blob-shape--${name}`}>
        {eyes && !openEyes && (
          <span
            className={`fm-blob__eyes ${headphones ? 'fm-blob__eyes--headphones' : ''} ${wink ? 'fm-blob__eyes--wink' : ''}`}
          />
        )}
        {eyes && openEyes && (
          <span className={`fm-blob__eyes fm-blob__eyes--open ${headphones ? 'fm-blob__eyes--headphones' : ''}`}>
            <span className="fm-blob__eye fm-blob__eye--left">
              <span className="fm-blob__brow" />
              <span className="fm-blob__pupil" />
            </span>
            <span className="fm-blob__eye fm-blob__eye--right">
              <span className="fm-blob__brow" />
              <span className="fm-blob__pupil" />
            </span>
          </span>
        )}
        {headphones && <span className="fm-blob__cord" />}
        {mouth !== 'none' && <span className={`fm-blob__mouth fm-blob__mouth--${mouth}`} />}
        {mouth !== 'none' && mouth !== 'smile' && <span className="fm-blob__mouth fm-blob__mouth--overlay" />}
        {arms && (
          <span className="fm-blob__arms">
            <span className="fm-blob__arm fm-blob__arm--left" />
            <span className="fm-blob__arm fm-blob__arm--right" />
          </span>
        )}
      </div>
    </div>
  )
}

export default function BlobCharacters({ variant = 'splash' }) {
  if (variant === 'home') {
    return (
      <div className="fm-blobs fm-blobs--home">
        <Blob name="blue-h" mouth="frown" openEyes />
        <Blob name="green-h" />
        <Blob name="yellow-h" mouth="smile" />
        <Blob name="black-h" mouth="o" openEyes />
        <Blob name="pink-h" mouth="frown" openEyes />
      </div>
    )
  }

  return (
    <div className="fm-blobs fm-blobs--splash">
      <Blob name="blue" />
      <Blob name="green" />
      <Blob name="yellow" mouth="smile" />
      <Blob name="black" headphones />
      <Blob name="pink" />
    </div>
  )
}
