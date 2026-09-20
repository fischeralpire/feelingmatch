import { useEffect, useMemo, useState } from 'react'
import { Search, Plus, Check } from 'lucide-react'
import { EMOTIONS, EMOTION_FAMILIES, AMPEL_COLORS, ampelForValence } from '../data/emotions'
import { customEmotionsService } from '../services/customEmotionsService'
import EmotionFace from './EmotionFace'
import CustomEmotionForm from './CustomEmotionForm'
import Button from './Button'
import { useT } from '../i18n/useT'
import './EmotionPicker.css'

function keyOf(emotion) {
  return emotion.id ?? emotion.name
}

// Durchsuchbare, nach Plutchik-Familie filterbare Liste aller Emotionen
// (siehe data/emotions.js) plus die eigenen, frei angelegten Emotionen der
// Person (siehe customEmotionsService.js). Erlaubt Mehrfachauswahl: Tiles
// togglen, "Fertig" bestätigt die ganze Auswahl auf einmal (onConfirm).
export default function EmotionPicker({ userId, onConfirm, children }) {
  const t = useT()
  const [query, setQuery] = useState('')
  const [family, setFamily] = useState(null)
  const [selected, setSelected] = useState(new Map())
  const [customEmotions, setCustomEmotions] = useState([])
  const [creating, setCreating] = useState(false)
  const [savingCustom, setSavingCustom] = useState(false)

  useEffect(() => {
    let active = true
    if (!userId) return
    customEmotionsService
      .list(userId)
      .then((list) => active && setCustomEmotions(list))
      .catch(() => {})
    return () => {
      active = false
    }
  }, [userId])

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    return EMOTION_FAMILIES.map((f) => ({
      ...f,
      items: EMOTIONS.filter((e) => {
        if (family && e.family !== family) return false
        if (!q) return e.family === f.id
        if (e.family !== f.id) return false
        return e.name.toLowerCase().includes(q) || (e.synonyms ?? []).some((s) => s.toLowerCase().includes(q))
      }),
    })).filter((g) => g.items.length > 0)
  }, [query, family])

  const filteredCustom = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return customEmotions
    return customEmotions.filter((e) => e.name.toLowerCase().includes(q))
  }, [query, customEmotions])

  function toggle(emotion) {
    setSelected((prev) => {
      const next = new Map(prev)
      const k = keyOf(emotion)
      if (next.has(k)) next.delete(k)
      else next.set(k, emotion)
      return next
    })
  }

  async function createCustom({ name, emoji, ampelColor }) {
    if (!userId) return
    setSavingCustom(true)
    try {
      const created = await customEmotionsService.create(userId, { name, emoji, ampelColor })
      setCustomEmotions((prev) => [...prev, created])
      setSelected((prev) => new Map(prev).set(keyOf(created), created))
      setCreating(false)
    } catch (err) {
      console.error('Eigene Emotion konnte nicht gespeichert werden:', err.message)
    } finally {
      setSavingCustom(false)
    }
  }

  const selectedList = Array.from(selected.values())

  return (
    <div className="fm-emopicker">
      <div className="fm-emopicker__search">
        <Search size={16} color="var(--text-faint)" />
        <input placeholder={t('modal.searchPlaceholder')} value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="fm-emopicker__chips">
        <button
          type="button"
          className={`fm-emopicker__chip ${family === null ? 'is-active' : ''}`}
          onClick={() => setFamily(null)}
        >
          {t('modal.all')}
        </button>
        {EMOTION_FAMILIES.map((f) => (
          <button
            key={f.id}
            type="button"
            className={`fm-emopicker__chip ${family === f.id ? 'is-active' : ''}`}
            onClick={() => setFamily(family === f.id ? null : f.id)}
          >
            {t(`emotionFamilies.${f.id}`)}
          </button>
        ))}
      </div>

      <div className="fm-emopicker__groups">
        {userId && (
          <div className="fm-emopicker__group">
            <div className="fm-emopicker__group-label">{t('modal.ownFeelings')}</div>
            <div className="fm-emotion-grid">
              {filteredCustom.map((emotion) => (
                <button
                  key={keyOf(emotion)}
                  type="button"
                  className={`fm-emotion-grid__item ${selected.has(keyOf(emotion)) ? 'is-selected' : ''}`}
                  onClick={() => toggle(emotion)}
                >
                  <div style={{ position: 'relative' }}>
                    <EmotionFace emoji={emotion.emoji} background={emotion.color} size={42} fontSize={20} />
                    <span
                      className="fm-emotion-grid__ampel"
                      style={{ background: AMPEL_COLORS[emotion.ampelColor] }}
                    />
                  </div>
                  <span>{emotion.name}</span>
                </button>
              ))}
              {!creating && (
                <button
                  type="button"
                  className="fm-emotion-grid__item fm-emotion-grid__item--add"
                  onClick={() => setCreating(true)}
                >
                  <div style={{ width: 42, height: 42, display: 'grid', placeItems: 'center' }}>
                    <Plus size={20} />
                  </div>
                  <span>{t('modal.newFeeling')}</span>
                </button>
              )}
            </div>
            {creating && (
              <CustomEmotionForm onCancel={() => setCreating(false)} onCreate={createCustom} saving={savingCustom} />
            )}
          </div>
        )}

        {groups.length === 0 && filteredCustom.length === 0 && !creating && (
          <p className="fm-muted" style={{ padding: '8px 0' }}>
            {t('modal.nothingFound')}
          </p>
        )}

        {groups.map((g) => (
          <div key={g.id} className="fm-emopicker__group">
            <div className="fm-emopicker__group-label">{t(`emotionFamilies.${g.id}`)}</div>
            <div className="fm-emotion-grid">
              {g.items.map((emotion) => (
                <button
                  key={emotion.name}
                  type="button"
                  className={`fm-emotion-grid__item ${selected.has(keyOf(emotion)) ? 'is-selected' : ''}`}
                  onClick={() => toggle(emotion)}
                >
                  <div style={{ position: 'relative' }}>
                    <EmotionFace emoji={emotion.emoji} background={emotion.color} size={42} fontSize={20} />
                    <span
                      className="fm-emotion-grid__ampel"
                      style={{ background: AMPEL_COLORS[ampelForValence(emotion.valence)] }}
                    />
                  </div>
                  <span>{t(`emotions.${emotion.name}`)}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {children}

      <div className="fm-emopicker__confirm">
        <Button variant="dark" disabled={selectedList.length === 0} onClick={() => onConfirm(selectedList)}>
          <Check size={16} /> {t('modal.confirm')}
          {selectedList.length > 0 ? ` (${selectedList.length})` : ''}
        </Button>
      </div>
    </div>
  )
}
