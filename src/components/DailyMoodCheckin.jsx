import { useState } from 'react'
import { ArrowRight, ClipboardList, Plus } from 'lucide-react'
import EmotionFace from './EmotionFace'
import EmotionPicker from './EmotionPicker'
import PainScale from './PainScale'
import HelpHint from './HelpHint'
import { useAuth } from '../context/AuthContext'
import { useLanguage } from '../context/LanguageContext'
import { profileService } from '../services/profileService'
import { FEATURED_EMOTIONS } from '../data/emotions'
import { useT } from '../i18n/useT'
import './DailyMoodCheckin.css'

// Erscheint einmal pro Tag beim Öffnen von Home (siehe HomePage.jsx), damit
// sich über die Zeit ein echter Stimmungsverlauf aufbaut (mood_logs). Das
// hindert nicht daran, später am Tag noch weitere Gefühle zu loggen – dieser
// Check-in ist nur ein Anstoß, kein Limit.
//
// Die Chip-Reihe zeigt nur eine kuratierte Kurzauswahl (FEATURED_EMOTIONS).
// "Alle Gefühle" öffnet denselben durchsuchbaren EmotionPicker wie das
// "+"-Stimmungs-Modal (MoodModal.jsx), damit hier keine Emotion der vollen
// Liste (data/emotions.js) unerreichbar bleibt.
//
// intensity ("wie stark?") ist bewusst dieselbe Frage/Skala wie
// profile.painScale auf dem Profil (siehe ProfilePage.jsx, PainScale.jsx) –
// landet daher an beiden Stellen: in mood_logs.intensity (Verlauf, an die
// gewählte Emotion gebunden) UND in profiles.pain_level (aktueller
// Momentanwert, den das Profil anzeigt), über setMood bzw.
// profileService.updatePainLevel.
export default function DailyMoodCheckin({ open, onSelect, onSkip, onDeepCheck }) {
  const { user } = useAuth()
  const { language } = useLanguage()
  const t = useT()
  const [selected, setSelected] = useState([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [intensity, setIntensity] = useState(null)
  if (!open) return null

  const weekday = new Date().toLocaleDateString(language, { weekday: 'long' })
  const intensityLabels = t('home.intensityLevels')

  function toggleFeatured(emotion) {
    setSelected((prev) => (prev.length === 1 && prev[0].name === emotion.name ? [] : [emotion]))
  }

  function handleSave() {
    if (selected.length === 0) return
    if (intensity) {
      profileService
        .updatePainLevel(user.id, intensity)
        .catch((err) => console.error('Intensität konnte nicht im Profil gespeichert werden:', err.message))
    }
    onSelect(selected, intensity)
  }

  return (
    <div className="fm-checkin-backdrop" onClick={onSkip}>
      <div className="fm-checkin-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="fm-checkin__kicker">
          {t('home.checkinKicker')} · {weekday}
        </div>
        <h1 className="fm-serif-hero fm-checkin__title">
          {t('home.checkinTitle', { name: user?.displayName || 'du' })}
        </h1>

        {pickerOpen ? (
          <EmotionPicker
            userId={user?.id}
            onConfirm={(emotions) => {
              setSelected(emotions)
              setPickerOpen(false)
            }}
          />
        ) : (
          <>
            <div className="fm-checkin__chips">
              {FEATURED_EMOTIONS.map((e) => (
                <button
                  key={e.name}
                  type="button"
                  className={`fm-checkin__chip ${selected.some((s) => s.name === e.name) ? 'is-selected' : ''}`}
                  onClick={() => toggleFeatured(e)}
                >
                  <EmotionFace emoji={e.emoji} background={e.color} size={44} fontSize={22} />
                  <span>{t(`emotions.${e.name}`)}</span>
                </button>
              ))}
              <button
                type="button"
                className="fm-checkin__chip fm-checkin__chip--more"
                onClick={() => setPickerOpen(true)}
              >
                <span className="fm-checkin__chip-plus">
                  <Plus size={20} />
                </span>
                <span>{t('modal.allFeelings')}</span>
              </button>
            </div>

            {selected.length > 0 && (
              <div className="fm-mood-row" style={{ marginTop: 14 }}>
                <div className="fm-mood-row__current">
                  {selected.map((s) => (
                    <EmotionFace key={s.name} emoji={s.emoji} background={s.color} size={32} fontSize={16} />
                  ))}
                  {selected.map((s) => t(`emotions.${s.name}`)).join(', ')}
                </div>
              </div>
            )}

            <div className="fm-checkin__intensity-row">
              <span>{t('home.checkinIntensityLabel')}</span>
              <span className="fm-checkin__intensity-value">{intensity ? intensityLabels[intensity - 1] : '–'}</span>
            </div>
            <PainScale fullWidth value={intensity} onSelect={setIntensity} />

            <button type="button" className="fm-checkin__save" disabled={selected.length === 0} onClick={handleSave}>
              {t('home.checkinSave')} <ArrowRight size={16} />
            </button>
          </>
        )}

        <button type="button" className="fm-checkin__deep" onClick={onDeepCheck}>
          <ClipboardList size={15} /> {t('modal.notSure')}
        </button>
        <HelpHint />

        <button type="button" className="fm-checkin__later" onClick={onSkip}>
          {t('common.later')}
        </button>
      </div>
    </div>
  )
}
