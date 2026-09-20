import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import EmotionFace from '../components/EmotionFace'
import { useLogoSrc } from '../hooks/useLogoSrc'
import { useT } from '../i18n/useT'

export default function FoundPage() {
  const navigate = useNavigate()
  const logoSrc = useLogoSrc()
  const t = useT()

  return (
    <div className="fm-page fm-page--tight">
      <div style={{ display: 'flex', justifyContent: 'center', margin: '6px 0 4px' }}>
        <img src={logoSrc} alt="FeelingMatch" style={{ width: 200, maxWidth: '70%', height: 'auto' }} />
      </div>
      <div className="fm-card" style={{ textAlign: 'center', marginTop: 8 }}>
        <EmotionFace
          emoji="🌙"
          background="linear-gradient(145deg,#ffd84a,#f9b500)"
          size={118}
          fontSize={56}
          style={{ margin: '0 auto 16px' }}
        />
        <div className="fm-kicker" style={{ textAlign: 'center' }}>
          {t('found.kicker')}
        </div>
        <h1 className="fm-serif-hero" style={{ fontSize: 34, marginTop: 4 }}>
          {t('found.title')}
        </h1>
        <p className="fm-muted" style={{ marginTop: 12 }}>
          {t('found.partnerLabel')} <strong style={{ color: 'var(--text)' }}>{t('chat.partnerName')}</strong>.
        </p>
        <Button variant="primary" onClick={() => navigate('/chat')} style={{ marginTop: 18 }}>
          {t('friends.openChat')}
        </Button>
        <Button variant="outline" onClick={() => navigate('/home')} style={{ marginTop: 10 }}>
          {t('common.cancel')}
        </Button>
      </div>
    </div>
  )
}
