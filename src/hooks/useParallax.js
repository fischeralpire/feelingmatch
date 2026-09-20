import { useEffect } from 'react'

// Setzt --mx/--my auf dem <html>-Element anhand von Maus-/Touch-Position.
// Die Blob-Maskottchen nutzen diese Variablen für einen sanften Parallax-Effekt.
export default function useParallax() {
  useEffect(() => {
    let raf = null
    const move = (cx, cy) => {
      const nx = (cx / window.innerWidth - 0.5) * 2
      const ny = (cy / window.innerHeight - 0.5) * 2
      if (raf) return
      raf = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--mx', nx.toFixed(3))
        document.documentElement.style.setProperty('--my', ny.toFixed(3))
        raf = null
      })
    }
    const onPointerMove = (e) => move(e.clientX, e.clientY)
    const onTouchMove = (e) => {
      const touch = e.touches?.[0]
      if (touch) move(touch.clientX, touch.clientY)
    }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('touchmove', onTouchMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])
}
