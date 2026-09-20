import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Phone, MessageCircle, Check } from 'lucide-react'
import Button from '../components/Button'
import EmotionFace from '../components/EmotionFace'
import MoodModal from '../components/MoodModal'
import HelpHint from '../components/HelpHint'
import { evaluateFeelingCheck } from '../data/panas'
import { INTENSITY_OPTIONS, DURATION_OPTIONS, isWarningSignal, CRISIS_RESOURCES } from '../data/safetyCheck'
import { useMood } from '../context/MoodContext'
import { useT } from '../i18n/useT'
import './PanasResultPage.css'

// Zwei mögliche Wege hierher: der volle Baum wurde durchlaufen (state.answers)
// oder ein "Passt das schon?"-Vorschlag wurde direkt angetippt (state.matched
// + die zu diesem Zeitpunkt errechnete Valenz/Aktivierung), siehe PanasPage.jsx.
function buildResult(state) {
  if (state?.matched) {
    return { matched: state.matched, valence: state.valence, arousal: state.arousal }
  }
  return evaluateFeelingCheck(state?.answers ?? [])
}

// Bewusst getrennt von der Emotions-Erkennung oben: nur bei klar negativem
// Ergebnis überhaupt sichtbar (siehe data/safetyCheck.js für die Schwellen-
// Logik). Antworten werden nirgends gespeichert.
export default function PanasResultPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { setMood } = useMood()
  const t = useT()
  const result = buildResult(state)
  const [intensity, setIntensity] = useState(null)
  const [duration, setDuration] = useState(null)
  const [safetyAnswer, setSafetyAnswer] = useState(null)
  const [savedMood, setSavedMood] = useState(null)
  const [pickerOpen, setPickerOpen] = useState(false)

  const showBurdenCheck = result.valence <= 2.2
  const warning = isWarningSignal(intensity, duration)
  const showSafetyQuestion = showBurdenCheck && warning && !safetyAnswer
  const showCrisisBlock = safetyAnswer === 'ja'
  const showReassurance = safetyAnswer === 'nein'
  const suggestFriendFirst = showReassurance

  // Status wird erst gespeichert, wenn man das aktiv bestätigt (oder eine
  // andere Emotion wählt) – kein automatisches Übernehmen mehr.
  function acceptMatch() {
    setMood(result.matched, 'panas')
    setSavedMood(result.matched)
  }
  function pickDifferent(emotion) {
    setMood(emotion, 'panas')
    setSavedMood(emotion)
    setPickerOpen(false)
  }

  return (
    <div className="fm-page" style={{ textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <span className="fm-topbar__title">{t('panasResult.title')}</span>
      </div>
      <EmotionFace
        emoji={result.matched.emoji}
        background={result.matched.color}
        size={118}
        fontSize={56}
        style={{ margin: '6px auto 16px' }}
      />
      <span className="fm-badge" style={{ background: 'var(--yellow)', color: '#15171c' }}>
        {t('panasResult.badge', { family: t(`emotionFamilies.${result.matched.family}`) })}
      </span>
      <h1 className="fm-serif-title" style={{ fontSize: 28, margin: '10px 0' }}>
        {t(`emotions.${result.matched.name}`)}
      </h1>
      <p className="fm-muted" style={{ marginBottom: 16 }}>
        {t('panasResult.description', { name: t(`emotions.${result.matched.name}`) })}
      </p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 22 }}>
        <div style={{ flex: 1, background: 'var(--green-light)', borderRadius: 16, padding: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--green)' }}>{result.valence.toFixed(1)}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t('panasResult.valence')}</div>
        </div>
        <div style={{ flex: 1, background: 'var(--blue-light)', borderRadius: 16, padding: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--blue)' }}>{result.arousal.toFixed(1)}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{t('panasResult.arousal')}</div>
        </div>
      </div>

      {savedMood ? (
        <p className="fm-result-save__confirm">
          <Check size={14} /> {t('panasResult.savedStatus')} <strong>{t(`emotions.${savedMood.name}`)}</strong>
        </p>
      ) : (
        <div className="fm-result-save">
          <Button variant="primary" onClick={acceptMatch}>
            <Check size={16} style={{ marginRight: 6 }} /> {t('panasResult.acceptStatus')}
          </Button>
          <Button variant="outline" onClick={() => setPickerOpen(true)} style={{ marginTop: 10 }}>
            {t('panasResult.pickDifferent')}
          </Button>
        </div>
      )}

      {showBurdenCheck && !showCrisisBlock && (
        <div className="fm-burden-check">
          <p className="fm-burden-check__label">{t('safety.burdenQuestion')}</p>
          <div className="fm-burden-check__chips">
            {INTENSITY_OPTIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`fm-burden-check__chip ${intensity === o.id ? 'is-active' : ''}`}
                onClick={() => setIntensity(intensity === o.id ? null : o.id)}
              >
                {t('safety.' + o.key)}
              </button>
            ))}
          </div>

          <p className="fm-burden-check__label" style={{ marginTop: 14 }}>
            {t('safety.sinceWhen')}
          </p>
          <div className="fm-burden-check__chips">
            {DURATION_OPTIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                className={`fm-burden-check__chip ${duration === o.id ? 'is-active' : ''}`}
                onClick={() => setDuration(duration === o.id ? null : o.id)}
              >
                {t('safety.' + o.key)}
              </button>
            ))}
          </div>
        </div>
      )}

      {showSafetyQuestion && (
        <div className="fm-safety-check">
          <p className="fm-safety-check__text">{t('safety.safetyQuestion')}</p>
          <div className="fm-safety-check__actions">
            <button type="button" className="fm-safety-check__btn" onClick={() => setSafetyAnswer('nein')}>
              {t('safety.no')}
            </button>
            <button
              type="button"
              className="fm-safety-check__btn fm-safety-check__btn--primary"
              onClick={() => setSafetyAnswer('ja')}
            >
              {t('safety.yesConcerned')}
            </button>
          </div>
        </div>
      )}

      {showReassurance && <p className="fm-safety-check__reassurance">{t('safety.reassurance')}</p>}

      {showCrisisBlock && (
        <div className="fm-crisis-card">
          <p className="fm-crisis-card__text">{t('safety.crisisText')}</p>
          <a href={CRISIS_RESOURCES.telefonseelsorgeTel} className="fm-crisis-card__phone">
            <Phone size={16} /> {CRISIS_RESOURCES.telefonseelsorgePhone}
          </a>
          <p className="fm-crisis-card__alt">
            {t('safety.crisisOr')} {CRISIS_RESOURCES.telefonseelsorgePhoneAlt} · {CRISIS_RESOURCES.telefonseelsorgeUrl}
          </p>
          <p className="fm-crisis-card__emergency">
            {t('safety.crisisEmergency')} {CRISIS_RESOURCES.emergencyPhone}
          </p>
        </div>
      )}

      {!showCrisisBlock && suggestFriendFirst ? (
        <>
          <Button variant="primary" onClick={() => navigate('/friends')}>
            <MessageCircle size={16} style={{ marginRight: 6 }} /> {t('panasResult.talkFriend')}
          </Button>
          <Button variant="outline" onClick={() => navigate('/search')} style={{ marginTop: 10 }}>
            {t('panasResult.findSomeone')}
          </Button>
        </>
      ) : (
        !showCrisisBlock && (
          <Button variant="primary" onClick={() => navigate('/search')}>
            {t('panasResult.findSomeone')} 💛
          </Button>
        )
      )}
      <Button variant="outline" onClick={() => navigate('/home')} style={{ marginTop: 10 }}>
        {t('panasResult.toHome')}
      </Button>
      {!showCrisisBlock && <HelpHint />}

      <MoodModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(emotion) => pickDifferent(emotion)}
        onDeepCheck={() => {
          setPickerOpen(false)
          navigate('/panas')
        }}
      />
    </div>
  )
}
