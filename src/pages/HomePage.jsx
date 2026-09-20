import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, Lock, MessageCircle, Clock, CircleHelp, ChevronRight, Plus, Lightbulb, Zap, Flame } from 'lucide-react'
import EmotionFace from '../components/EmotionFace'
import BlobCharacters from '../components/BlobCharacters'
import MoodModal from '../components/MoodModal'
import DailyMoodCheckin from '../components/DailyMoodCheckin'
import AvatarUnlockModal from '../components/AvatarUnlockModal'
import { FEATURED_EMOTIONS } from '../data/emotions'
import { resolveMoodTipFamily } from '../data/moodTips'
import { useAuth } from '../context/AuthContext'
import { useMood } from '../context/MoodContext'
import { useLanguage } from '../context/LanguageContext'
import { moodService } from '../services/moodService'
import { gamificationService } from '../services/gamificationService'
import { buildCurrentWeekDots, calculateStreak } from '../utils/weekStats'
import { useLogoSrc } from '../hooks/useLogoSrc'
import { useT } from '../i18n/useT'
import './HomePage.css'

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { mood, setMood } = useMood()
  const { language } = useLanguage()
  const logoSrc = useLogoSrc()
  const tipFamily = resolveMoodTipFamily(mood)
  const t = useT()
  const [modalOpen, setModalOpen] = useState(false)
  const [dailyCheckinOpen, setDailyCheckinOpen] = useState(false)
  const [xp, setXp] = useState(0)
  const [newlyUnlockedAvatars, setNewlyUnlockedAvatars] = useState([])
  const [weekDots, setWeekDots] = useState([])
  const [streak, setStreak] = useState(0)
  const [greeting] = useState(() => {
    const templates = t('home.greetings')
    const template = templates[Math.floor(Math.random() * templates.length)]
    return template.replace('{name}', user?.displayName || 'Nutzer')
  })

  useEffect(() => {
    let active = true
    moodService
      .hasLoggedToday(user.id)
      .then((logged) => active && setDailyCheckinOpen(!logged))
      .catch(() => {})
    gamificationService
      .getProgress(user.id)
      .then((p) => active && setXp(p.xp))
      .catch((err) => console.error('XP konnte nicht geladen werden:', err.message))
    moodService
      .getHistory(user.id)
      .then((history) => {
        if (!active) return
        setWeekDots(buildCurrentWeekDots(history, language))
        setStreak(calculateStreak(history))
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [user.id, language])

  return (
    <div className="fm-page">
      <div className="fm-home__top">
        <div className="fm-home__brand">
          <img src={logoSrc} alt="FeelingMatch" />
        </div>
        <div className="fm-home__status">
          <span className="fm-home__xp">
            <Zap size={13} color="var(--yellow)" fill="var(--yellow)" /> {xp} XP
          </span>
          <span className="fm-home__mood">
            <EmotionFace emoji={mood.emoji} background={mood.color} size={38} fontSize={19} />
          </span>
        </div>
      </div>

      <section className="fm-hero-card">
        <div className="fm-greeting">{greeting}</div>
        <h1 className="fm-serif-hero" style={{ maxWidth: 190 }}>
          <span className="fm-serif-hero__highlight">{t('home.heroTitle')}</span>
        </h1>
        <BlobCharacters variant="splash" />
      </section>

      <section style={{ marginTop: 40 }}>
        <div className="fm-section-row">
          <h2 className="fm-section-title">{t('home.sectionMood')}</h2>
          <button type="button" className="fm-section-row__link" onClick={() => setModalOpen(true)}>
            {t('home.showAll')} <ChevronRight size={15} />
          </button>
        </div>
        <div className="fm-mood-stories">
          {FEATURED_EMOTIONS.map((e, i) => (
            <button
              key={e.name}
              type="button"
              className={`fm-mood-story ${mood.name === e.name ? 'is-selected' : ''}`}
              style={{ '--i': i }}
              onClick={() => setMood(e)}
            >
              <EmotionFace emoji={e.emoji} background={e.color} size={56} fontSize={26} className="fm-mood-story__circle" />
              <span className="fm-mood-story__label">{t(`emotions.${e.name}`)}</span>
            </button>
          ))}
          <button type="button" className="fm-mood-story" style={{ '--i': FEATURED_EMOTIONS.length }} onClick={() => setModalOpen(true)}>
            <span className="fm-mood-story__circle fm-mood-story__circle--add">
              <Plus size={22} />
            </span>
            <span className="fm-mood-story__label">{t('home.more')}</span>
          </button>
        </div>
      </section>

      <div className="fm-panas-banner" onClick={() => navigate('/panas')}>
        <div className="fm-panas-banner__icon">
          <CircleHelp size={20} color="#fff" strokeWidth={2.3} />
        </div>
        <div className="fm-panas-banner__text">
          <div>{t('home.panasTitle')}</div>
          <small>{t('home.panasSubtitle')}</small>
        </div>
        <ChevronRight size={22} color="var(--purple)" />
      </div>

      <section className="fm-week-card">
        <div className="fm-week-card__head">
          <h2 className="fm-section-title">{t('home.weekTitle')}</h2>
          <span className="fm-week-card__streak">
            <Flame size={13} /> {t('home.weekStreak', { n: streak })}
          </span>
        </div>
        <div className="fm-week-card__days">
          {weekDots.map((d, i) => (
            <div key={i} className={`fm-week-card__day ${d.isToday ? 'is-today' : ''}`}>
              <span className="fm-week-card__dot" style={{ background: d.color ?? 'var(--surface-muted)' }} />
              <span className="fm-week-card__label">{d.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="fm-match-card">
        <h2 className="fm-serif-title" style={{ fontSize: 26, maxWidth: 200, fontStyle: 'italic' }}>
          {t('home.matchTitle')}
        </h2>
        <p className="fm-match-card__sub">{t('home.matchSubtitle')}</p>
        <button type="button" className="fm-btn fm-btn--dark" onClick={() => navigate('/match')}>
          <Users size={16} /> {t('home.matchCta')}
        </button>

        <div className="fm-match-card__bullets">
          <span>
            <Lock size={13} /> {t('home.featureAnonShort')}
          </span>
          <span>
            <MessageCircle size={13} /> {t('home.featureChatShort')}
          </span>
          <span>
            <Clock size={13} /> {t('home.featureTimeShort')}
          </span>
        </div>
      </section>

      <section className="fm-mood-tip">
        <div className="fm-mood-tip__head">
          <EmotionFace emoji={mood.emoji} background="rgba(255,255,255,0.55)" size={30} fontSize={15} />
          <span>{t('home.moodTipTitle')}</span>
        </div>
        <p className="fm-mood-tip__text">{t(`moodTips.${tipFamily}.why`)}</p>
        <div className="fm-mood-tip__tip">
          <Lightbulb size={15} />
          <p>{t(`moodTips.${tipFamily}.tip`)}</p>
        </div>
      </section>

      <MoodModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={(emotion) => {
          setMood(emotion)
          setModalOpen(false)
        }}
        onDeepCheck={() => {
          setModalOpen(false)
          navigate('/panas')
        }}
      />

      <DailyMoodCheckin
        open={dailyCheckinOpen}
        onSelect={(m, intensity) => {
          setMood(m, 'daily_checkin', intensity)
          setDailyCheckinOpen(false)
          gamificationService
            .awardCheckinXpIfNewDay(user.id)
            .then((result) => {
              setXp(result.xp)
              if (result.newlyUnlocked.length > 0) setNewlyUnlockedAvatars(result.newlyUnlocked)
              if (result.xpAwarded > 0) {
                gamificationService
                  .enterRandomRaffle()
                  .catch((err) => console.error('Zufalls-Sorteo konnte nicht gezählt werden:', err.message))
              }
            })
            .catch((err) => console.error('Check-in-XP konnte nicht gespeichert werden:', err.message))
        }}
        onSkip={() => setDailyCheckinOpen(false)}
        onDeepCheck={() => {
          setDailyCheckinOpen(false)
          navigate('/panas')
        }}
      />

      <AvatarUnlockModal avatars={newlyUnlockedAvatars} onClose={() => setNewlyUnlockedAvatars([])} />
    </div>
  )
}
