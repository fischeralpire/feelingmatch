import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import EmotionFace from '../components/EmotionFace'
import { useMood } from '../context/MoodContext'
import { useT } from '../i18n/useT'
import './SearchPage.css'

// Simuliert die Suche automatisch (kein manueller "Match simulieren"-Klick
// mehr nötig) und geht nach kurzer Zeit von selbst zu /found weiter, damit
// sich der Match-Flow wieder wie eine echte Suche anfühlt.
export default function SearchPage() {
  const navigate = useNavigate()
  const { mood } = useMood()
  const t = useT()

  useEffect(() => {
    const id = setTimeout(() => navigate('/found'), 2600)
    return () => clearTimeout(id)
  }, [navigate])

  return (
    <div className="fm-page fm-page--centered">
      <div className="fm-search-rings">
        <EmotionFace emoji={mood.emoji} background="#fff" size={90} fontSize={44} />
      </div>
      <div className="fm-kicker" style={{ textAlign: 'center', marginTop: 28, marginBottom: 0 }}>
        {t('search.kicker')}
      </div>
      <h1 className="fm-serif-hero" style={{ fontSize: 34, marginTop: 6 }}>
        {t('search.title')}
      </h1>
      <p className="fm-muted" style={{ margin: '12px auto 0', maxWidth: 300 }}>
        {t('search.subtitle')}
      </p>
    </div>
  )
}
