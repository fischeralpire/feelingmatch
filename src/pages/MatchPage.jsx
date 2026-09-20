import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircleHelp, ChevronRight, Info } from 'lucide-react'
import Button from '../components/Button'
import Toggle from '../components/Toggle'
import EmotionFace from '../components/EmotionFace'
import MoodModal from '../components/MoodModal'
import { useAuth } from '../context/AuthContext'
import { useMood } from '../context/MoodContext'
import { moodService } from '../services/moodService'
import { useT } from '../i18n/useT'

export default function MatchPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { mood, setMood } = useMood()
  const t = useT()
  const [hasLogged, setHasLogged] = useState(null)
  const [moodPickerOpen, setMoodPickerOpen] = useState(false)
  const [options, setOptions] = useState([
    { key: 'similar', label: t('match.optSimilar'), hint: t('match.optSimilarHint'), on: true },
    { key: 'exact', label: t('match.optExact'), hint: t('match.optExactHint'), on: false },
    { key: 'talk', label: t('match.optTalk'), hint: t('match.optTalkHint'), on: true },
    { key: 'listen', label: t('match.optListen'), hint: t('match.optListenHint'), on: false },
    { key: 'language', label: t('match.optLanguage'), hint: t('match.optLanguageHint'), on: true },
  ])

  useEffect(() => {
    let active = true
    moodService
      .hasLoggedToday(user.id)
      .then((logged) => active && setHasLogged(logged))
      .catch(() => active && setHasLogged(true))
    return () => {
      active = false
    }
  }, [user.id])

  function toggle(key) {
    setOptions((prev) => prev.map((o) => (o.key === key ? { ...o, on: !o.on } : o)))
  }

  return (
    <div className="fm-page">
      <div className="fm-card">
        <h2 className="fm-serif-title" style={{ fontSize: 30 }}>
          {t('match.title')}
        </h2>

        <div className="fm-demo-notice">
          <span className="fm-demo-notice__badge">
            <Info size={12} /> {t('match.demoBadge')}
          </span>
          <p>{t('match.demoText')}</p>
        </div>

        {hasLogged === false && (
          <button type="button" className="fm-panas-banner" style={{ marginTop: 16 }} onClick={() => navigate('/panas')}>
            <div className="fm-panas-banner__icon">
              <CircleHelp size={20} color="#fff" strokeWidth={2.3} />
            </div>
            <div className="fm-panas-banner__text">
              <div>{t('home.panasTitle')}</div>
              <small>{t('home.panasSubtitle')}</small>
            </div>
            <ChevronRight size={22} color="var(--purple)" />
          </button>
        )}

        {hasLogged && (
          <div className="fm-mood-row" style={{ marginTop: 16 }}>
            <div className="fm-mood-row__current">
              <EmotionFace emoji={mood.emoji} background={mood.color} size={32} fontSize={16} />
              {t(`emotions.${mood.name}`)}
            </div>
            <button type="button" className="fm-mood-row__change" onClick={() => setMoodPickerOpen(true)}>
              {t('profile.changeEmotion')}
            </button>
          </div>
        )}

        {hasLogged && (
          <>
            <div style={{ display: 'grid', gap: 10, marginTop: 16 }}>
              {options.map((o) => (
                <div className="fm-toggle-row" key={o.key}>
                  <div>
                    <strong>{o.label}</strong>
                    <br />
                    <span>{o.hint}</span>
                  </div>
                  <Toggle on={o.on} onToggle={() => toggle(o.key)} label={o.label} />
                </div>
              ))}
            </div>
            <Button variant="primary" onClick={() => navigate('/search')} style={{ marginTop: 16 }}>
              {t('match.findSomeone')}
            </Button>
          </>
        )}
      </div>

      <MoodModal
        open={moodPickerOpen}
        onClose={() => setMoodPickerOpen(false)}
        onSelect={(emotion) => {
          setMood(emotion)
          setHasLogged(true)
          setMoodPickerOpen(false)
        }}
        onDeepCheck={() => {
          setMoodPickerOpen(false)
          navigate('/panas')
        }}
      />
    </div>
  )
}
