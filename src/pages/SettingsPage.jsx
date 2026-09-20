import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, ShieldCheck, Palette, Users, HelpCircle, LogOut, ChevronRight, ChevronDown, Globe } from 'lucide-react'
import TopBar from '../components/TopBar'
import LanguagePicker from '../components/LanguagePicker'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useLanguage, LANGUAGES } from '../context/LanguageContext'
import { useT } from '../i18n/useT'
import { ACCENTS } from '../data/accents'

function OptionRow({ icon: Icon, label, onClick, expanded }) {
  return (
    <button type="button" className="fm-option-row" onClick={onClick}>
      <span className="fm-option-row__icon">
        <Icon size={18} />
      </span>
      <span className="fm-option-row__label">{label}</span>
      <span className="fm-option-row__chevron">
        {expanded === undefined ? <ChevronRight size={18} /> : expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </span>
    </button>
  )
}

export default function SettingsPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { accent, setAccent } = useTheme()
  const { language } = useLanguage()
  const t = useT()
  const [appearanceOpen, setAppearanceOpen] = useState(false)
  const [languageOpen, setLanguageOpen] = useState(false)

  const currentLanguageLabel = LANGUAGES.find((l) => l.id === language)?.label ?? language

  async function handleLogout() {
    await logout()
    navigate('/welcome')
  }

  return (
    <div className="fm-page fm-page--tight">
      <TopBar back="/profile" title={t('settings.title')} />

      <div className="fm-option-group">
        <OptionRow icon={Bell} label={t('settings.notifications')} />
        <OptionRow icon={ShieldCheck} label={t('settings.privacy')} />
        <OptionRow icon={Palette} label={t('settings.appearance')} expanded={appearanceOpen} onClick={() => setAppearanceOpen((v) => !v)} />
        {appearanceOpen && (
          <div className="fm-appearance-panel">
            <div className="fm-appearance-panel__group">
              <span className="fm-field__label">{t('settings.accentColor')}</span>
              <div className="fm-appearance-panel__row">
                {ACCENTS.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    className={`fm-swatch ${accent === a.id ? 'is-selected' : ''}`}
                    style={{ background: a.swatch }}
                    onClick={() => setAccent(a.id)}
                    aria-label={a.label}
                    title={a.label}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <OptionRow
          icon={Globe}
          label={`${t('language.label')} · ${currentLanguageLabel}`}
          expanded={languageOpen}
          onClick={() => setLanguageOpen((v) => !v)}
        />
        {languageOpen && (
          <div className="fm-appearance-panel">
            <LanguagePicker />
          </div>
        )}
      </div>

      <div className="fm-option-group">
        <OptionRow icon={Users} label={t('settings.blocked')} />
        <OptionRow icon={HelpCircle} label={t('settings.help')} />
      </div>

      <div className="fm-option-group">
        <button type="button" className="fm-option-row" onClick={handleLogout}>
          <span className="fm-option-row__icon">
            <LogOut size={18} color="var(--red)" />
          </span>
          <span className="fm-option-row__label" style={{ color: 'var(--red)', fontWeight: 700 }}>
            {t('settings.logout')}
          </span>
        </button>
      </div>

      <p className="fm-muted" style={{ textAlign: 'center', fontSize: 12, marginTop: 20 }}>
        © {new Date().getFullYear()} Joanna Fischer Alpire · FeelingMatch
      </p>
    </div>
  )
}
