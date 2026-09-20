import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { EMOTIONS, VALENCE_BY_NAME } from '../data/emotions'
import { useAuth } from './AuthContext'
import { moodService } from '../services/moodService'
import { useT } from '../i18n/useT'

const MoodContext = createContext(null)

// Aktuell gewählte Stimmung – wird auf Home ausgewählt und auf Result/Match/
// Chat wiederverwendet. `setMood` akzeptiert eine einzelne Emotion oder ein
// Array (Mehrfachauswahl im EmotionPicker) – bei mehreren wird jede einzeln
// in mood_logs geloggt, angezeigt (Pille/Gruß/Ampel) wird die zuletzt
// ausgewählte.
export function MoodProvider({ children }) {
  const { user } = useAuth()
  const t = useT()
  const [mood, setMoodState] = useState(EMOTIONS[0])
  const [failedSaves, setFailedSaves] = useState([])

  // Speichert einmal, versucht bei Fehlschlag (z.B. kurzer Netzwerkaussetzer)
  // nach 2s automatisch noch einmal, bevor sichtbar ein Fehler gezeigt wird –
  // vorher scheiterte das lautlos (nur console.error), wodurch Tage im Streak
  // fehlten, ohne dass jemand es bemerkt hat.
  const persist = useCallback((userId, m, source, valence, intensity, isRetry = false) => {
    moodService
      .logMood(userId, m, source, valence, intensity)
      .then(() => {
        if (isRetry) setFailedSaves((prev) => prev.filter((f) => f.m.name !== m.name || f.source !== source))
      })
      .catch((err) => {
        console.error('Stimmung konnte nicht gespeichert werden:', err.message)
        if (!isRetry) {
          setTimeout(() => persist(userId, m, source, valence, intensity, true), 2000)
        } else {
          setFailedSaves((prev) => [...prev, { userId, m, source, valence, intensity }])
        }
      })
  }, [])

  // intensity (aktuell nur vom täglichen Check-in gesetzt) landet 1:1 in
  // mood_logs.intensity für jede geloggte Emotion dieses Aufrufs – dieselbe
  // Frage/Skala wie profiles.pain_level (das DailyMoodCheckin.jsx separat
  // per profileService.updatePainLevel aktualisiert), hier aber an die
  // jeweilige Emotion gebunden statt nur als aktueller Momentanwert.
  const setMood = useCallback(
    (next, source = 'home', intensity = null) => {
      const list = Array.isArray(next) ? next : [next]
      if (list.length === 0) return
      setMoodState(list[list.length - 1])
      if (user) {
        for (const m of list) {
          const valence = m.valence ?? VALENCE_BY_NAME[m.name] ?? null
          persist(user.id, m, source, valence, intensity)
        }
      }
    },
    [user, persist],
  )

  const retryFailedSave = useCallback(
    (failed) => {
      setFailedSaves((prev) => prev.filter((f) => f !== failed))
      persist(failed.userId, failed.m, failed.source, failed.valence, failed.intensity)
    },
    [persist],
  )

  const dismissFailedSave = useCallback((failed) => {
    setFailedSaves((prev) => prev.filter((f) => f !== failed))
  }, [])

  const value = useMemo(() => ({ mood, setMood }), [mood, setMood])

  return (
    <MoodContext.Provider value={value}>
      {children}
      {failedSaves.length > 0 && (
        <div className="fm-save-toast-stack">
          {failedSaves.map((failed, i) => (
            <div className="fm-save-toast" role="alert" key={`${failed.m.name}-${failed.source}-${i}`}>
              <span>{t('moodSave.notSaved', { name: t(`emotions.${failed.m.name}`) })}</span>
              <button type="button" className="fm-save-toast__retry" onClick={() => retryFailedSave(failed)}>
                {t('moodSave.retry')}
              </button>
              <button
                type="button"
                className="fm-save-toast__dismiss"
                onClick={() => dismissFailedSave(failed)}
                aria-label={t('moodSave.close')}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </MoodContext.Provider>
  )
}

export function useMood() {
  const ctx = useContext(MoodContext)
  if (!ctx) throw new Error('useMood muss innerhalb von <MoodProvider> verwendet werden.')
  return ctx
}
