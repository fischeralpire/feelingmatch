import { useState } from 'react'
import { Lock, Globe, X } from 'lucide-react'
import Button from './Button'
import LanguagePicker from './LanguagePicker'
import { useLanguage, LANGUAGES } from '../context/LanguageContext'
import { useT } from '../i18n/useT'
import { readValue, writeValue } from '../services/storage'

// Kein echter Zugriffsschutz (das Passwort landet im Browser-Bundle), sondern
// eine bewusst simple Hürde: hält Zufallsbesucher der öffentlichen Vercel-URL
// fern, solange es noch keine echte Nutzerverwaltung gibt. Passwort wird über
// die Umgebungsvariable VITE_APP_PASSWORD gesetzt (siehe .env.example).
const APP_PASSWORD = import.meta.env.VITE_APP_PASSWORD
const UNLOCK_KEY = 'gate-unlocked'

export default function PasswordGate({ children }) {
  const [unlocked, setUnlocked] = useState(() => !APP_PASSWORD || readValue(UNLOCK_KEY, false) === true)
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const { language } = useLanguage()
  const t = useT()
  const currentLanguageLabel = LANGUAGES.find((l) => l.id === language)?.label ?? language

  if (unlocked) return children

  function handleSubmit(e) {
    e.preventDefault()
    if (value === APP_PASSWORD) {
      writeValue(UNLOCK_KEY, true)
      setUnlocked(true)
    } else {
      setError(true)
    }
  }

  return (
    <div className="fm-shell">
      <div className="fm-page fm-page--centered">
        <button
          type="button"
          className="fm-splash__lang"
          style={{ position: 'absolute', top: 20, insetInlineEnd: 20 }}
          onClick={() => setLangOpen(true)}
        >
          <Globe size={15} /> {currentLanguageLabel}
        </button>
        <div className="fm-card" style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'var(--surface-muted)',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Lock size={22} color="var(--text)" />
            </div>
          </div>
          <h1 className="fm-serif-title" style={{ fontSize: 26 }}>
            {t('gate.title')}
          </h1>
          <p className="fm-muted" style={{ margin: '8px 0 20px' }}>
            {t('gate.subtitle')}
          </p>
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              className="fm-input"
              placeholder={t('gate.placeholder')}
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                setError(false)
              }}
              autoFocus
              style={{ marginBottom: 12, textAlign: 'center' }}
            />
            {error && <p style={{ color: 'var(--red)', fontSize: 13, marginBottom: 12 }}>{t('gate.wrong')}</p>}
            <Button type="submit" variant="primary">
              {t('gate.submit')}
            </Button>
          </form>
        </div>
      </div>

      {langOpen && (
        <div className="fm-modal-backdrop" onClick={() => setLangOpen(false)}>
          <div className="fm-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="fm-modal-sheet__handle" />
            <div className="fm-modal-sheet__header">
              <span className="fm-modal-sheet__title">{t('language.label')}</span>
              <button type="button" className="fm-btn fm-btn--icon" onClick={() => setLangOpen(false)} aria-label={t('modal.close')}>
                <X size={16} />
              </button>
            </div>
            <LanguagePicker onSelect={() => setLangOpen(false)} />
          </div>
        </div>
      )}
    </div>
  )
}
