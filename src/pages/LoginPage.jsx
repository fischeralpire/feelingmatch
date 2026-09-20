import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import TopBar from '../components/TopBar'
import { useAuth } from '../context/AuthContext'
import { useLogoSrc } from '../hooks/useLogoSrc'
import { useT } from '../i18n/useT'
import './AuthPages.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, sendMagicLink } = useAuth()
  const logoSrc = useLogoSrc()
  const t = useT()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  // Nach 2 falschen Versuchen bieten wir den Magic-Link-Ausweg an, statt nur
  // stumm weiter nach dem Passwort zu fragen.
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [magicLinkState, setMagicLinkState] = useState('idle') // idle | sending | sent | error

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login({ email, password })
      navigate('/home')
    } catch (err) {
      setError(err.message)
      setFailedAttempts((n) => n + 1)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleMagicLink() {
    if (!email) {
      setMagicLinkState('needEmail')
      return
    }
    setMagicLinkState('sending')
    try {
      await sendMagicLink(email)
      setMagicLinkState('sent')
    } catch (err) {
      setError(err.message)
      setMagicLinkState('error')
    }
  }

  return (
    <div className="fm-shell">
      <div className="fm-page fm-page--tight">
        <TopBar back="/welcome" />
        <div className="fm-auth__logo">
          <img src={logoSrc} alt="FeelingMatch" />
        </div>
        <h1 className="fm-serif-title" style={{ textAlign: 'center', marginTop: 8 }}>
          {t('auth.login.title')}
        </h1>
        <p className="fm-muted" style={{ textAlign: 'center', margin: '6px 0 24px' }}>
          {t('auth.login.subtitle')}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="fm-field">
            <label className="fm-field__label" htmlFor="login-email">
              {t('auth.login.email')}
            </label>
            <input
              id="login-email"
              className="fm-input"
              type="email"
              placeholder="deine@email.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="fm-field">
            <label className="fm-field__label" htmlFor="login-password">
              {t('auth.login.password')}
            </label>
            <input
              id="login-password"
              className="fm-input"
              type="password"
              placeholder={t('auth.login.passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="fm-auth__error">{error}</p>}

          {failedAttempts >= 2 && magicLinkState !== 'sent' && (
            <p className="fm-auth__switch" style={{ marginTop: -4, marginBottom: 16 }}>
              <span onClick={handleMagicLink}>
                {magicLinkState === 'sending' ? t('auth.login.magicLinkSending') : t('auth.login.forgotPassword')}
              </span>
            </p>
          )}
          {magicLinkState === 'needEmail' && (
            <p className="fm-auth__error" style={{ marginTop: -8 }}>
              {t('auth.login.magicLinkNeedEmail')}
            </p>
          )}
          {magicLinkState === 'sent' && (
            <p className="fm-muted" style={{ textAlign: 'center', marginTop: -4, marginBottom: 16 }}>
              {t('auth.login.magicLinkSent')}
            </p>
          )}

          <Button type="submit" variant="primary" disabled={submitting}>
            {t('auth.login.submit')}
          </Button>
        </form>

        <p className="fm-auth__switch">
          {t('auth.login.noAccount')} <span onClick={() => navigate('/register')}>{t('auth.login.registerLink')}</span>
        </p>
      </div>
    </div>
  )
}
