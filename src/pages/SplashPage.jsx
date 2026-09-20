import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe, X } from 'lucide-react'
import Button from '../components/Button'
import BlobCharacters from '../components/BlobCharacters'
import LanguagePicker from '../components/LanguagePicker'
import { useAuth } from '../context/AuthContext'
import { useLanguage, LANGUAGES } from '../context/LanguageContext'
import { useLogoSrc } from '../hooks/useLogoSrc'
import { useT } from '../i18n/useT'
import './SplashPage.css'
import './AuthPages.css'

export default function SplashPage() {
  const navigate = useNavigate()
  const { continueAsGuest } = useAuth()
  const { language } = useLanguage()
  const logoSrc = useLogoSrc()
  const t = useT()
  const [langOpen, setLangOpen] = useState(false)
  const [guestSheetOpen, setGuestSheetOpen] = useState(false)
  const [guestLoading, setGuestLoading] = useState(false)
  const [guestError, setGuestError] = useState('')
  const currentLanguageLabel = LANGUAGES.find((l) => l.id === language)?.label ?? language

  async function handleConfirmGuest() {
    setGuestError('')
    setGuestLoading(true)
    try {
      await continueAsGuest()
      navigate('/home')
    } catch (err) {
      setGuestError(err.message)
      setGuestLoading(false)
    }
  }

  return (
    <div className="fm-shell">
      <div className="fm-page fm-splash fm-page--tight">
        <button type="button" className="fm-splash__lang" onClick={() => setLangOpen(true)}>
          <Globe size={15} /> {currentLanguageLabel}
        </button>

        <div className="fm-splash__logo">
          <img src={logoSrc} alt="FeelingMatch" />
        </div>

        <BlobCharacters variant="splash" />

        <div className="fm-splash__copy">
          <div className="fm-kicker">{t('splash.kicker')}</div>
          <h1 className="fm-serif-hero">{t('splash.title')}</h1>
          <p className="fm-splash__sub">{t('splash.subtitle')}</p>
        </div>

        <div className="fm-splash__actions">
          <Button variant="primary" onClick={() => navigate('/register')}>
            {t('splash.registerCta')}
          </Button>
          <Button variant="outline" onClick={() => navigate('/login')}>
            {t('splash.loginCta')}
          </Button>
          <Button variant="ghost" onClick={() => setGuestSheetOpen(true)}>
            {t('splash.guestCta')}
          </Button>
        </div>
      </div>

      {guestSheetOpen && (
        <div className="fm-modal-backdrop" onClick={() => !guestLoading && setGuestSheetOpen(false)}>
          <div className="fm-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="fm-modal-sheet__handle" />
            <div className="fm-modal-sheet__header">
              <span className="fm-modal-sheet__title">{t('splash.guestSheetTitle')}</span>
              <button
                type="button"
                className="fm-btn fm-btn--icon"
                onClick={() => setGuestSheetOpen(false)}
                aria-label={t('modal.close')}
                disabled={guestLoading}
              >
                <X size={16} />
              </button>
            </div>
            <p className="fm-splash__sub" style={{ margin: '0 0 12px' }}>
              {t('splash.guestSheetIntro')}
            </p>
            <ul className="fm-splash__guestList">
              <li>{t('splash.guestSheetPoint1')}</li>
              <li>{t('splash.guestSheetPoint2')}</li>
              <li>{t('splash.guestSheetPoint3')}</li>
            </ul>
            {guestError && <p className="fm-auth__error">{guestError}</p>}
            <Button variant="primary" onClick={handleConfirmGuest} disabled={guestLoading}>
              {guestLoading ? t('splash.guestCtaLoading') : t('splash.guestSheetConfirm')}
            </Button>
          </div>
        </div>
      )}

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
