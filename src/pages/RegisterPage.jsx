import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, Globe } from 'lucide-react'
import Button from '../components/Button'
import TopBar from '../components/TopBar'
import { useAuth } from '../context/AuthContext'
import { LANGUAGES, useLanguage } from '../context/LanguageContext'
import { useT } from '../i18n/useT'
import './AuthPages.css'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const { language, setLanguage } = useLanguage()
  const t = useT()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('keine_angabe')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register({ displayName, email, password, age, gender })
      navigate('/home')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fm-shell">
      <div className="fm-page fm-page--tight">
        <TopBar back="/welcome" />
        <h1 className="fm-serif-title">{t('auth.register.title')}</h1>
        <p className="fm-muted" style={{ margin: '0 0 24px' }}>
          {t('auth.register.subtitle')}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="fm-field">
            <label className="fm-field__label" htmlFor="register-language">
              {t('language.label')}
            </label>
            <div className="fm-auth__language">
              <Globe size={18} />
              <select
                id="register-language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="fm-field">
            <label className="fm-field__label" htmlFor="register-name">
              {t('auth.register.name')}
            </label>
            <input
              id="register-name"
              className="fm-input"
              type="text"
              placeholder={t('auth.register.namePlaceholder')}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="fm-field">
            <label className="fm-field__label" htmlFor="register-email">
              {t('auth.register.email')}
            </label>
            <input
              id="register-email"
              className="fm-input"
              type="email"
              placeholder="deine@email.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="fm-field">
            <label className="fm-field__label" htmlFor="register-password">
              {t('auth.register.password')}
            </label>
            <input
              id="register-password"
              className="fm-input"
              type="password"
              placeholder={t('auth.register.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
          </div>
          <div className="fm-field">
            <label className="fm-field__label" htmlFor="register-age">
              {t('auth.register.age')}
            </label>
            <input
              id="register-age"
              className="fm-input"
              type="number"
              placeholder="z.B. 24"
              min={13}
              max={119}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />
          </div>
          <div className="fm-field">
            <label className="fm-field__label" htmlFor="register-gender">
              {t('auth.register.gender')}
            </label>
            <select
              id="register-gender"
              className="fm-input"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="keine_angabe">{t('auth.register.genderNone')}</option>
              <option value="weiblich">{t('auth.register.genderFemale')}</option>
              <option value="maennlich">{t('auth.register.genderMale')}</option>
              <option value="divers">{t('auth.register.genderDiverse')}</option>
            </select>
          </div>
          {error && <p className="fm-auth__error">{error}</p>}
          <Button type="submit" variant="primary" disabled={submitting}>
            {t('auth.register.submit')} <Check size={16} />
          </Button>
        </form>

        <p className="fm-auth__switch">
          {t('auth.register.hasAccount')} <span onClick={() => navigate('/login')}>{t('auth.register.loginLink')}</span>
        </p>
      </div>
    </div>
  )
}
