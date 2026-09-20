import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, MessageCircle, Check, Lock, Sparkles, Zap } from 'lucide-react'
import EmotionFace from '../components/EmotionFace'
import Button from '../components/Button'
import AmpelCircles from '../components/AmpelCircles'
import PainScale from '../components/PainScale'
import MoodModal from '../components/MoodModal'
import AvatarUnlockModal from '../components/AvatarUnlockModal'
import { useAuth } from '../context/AuthContext'
import { useMood } from '../context/MoodContext'
import { moodService } from '../services/moodService'
import { profileService } from '../services/profileService'
import { gamificationService, XP_PER_AVATAR, XP_PER_DAY } from '../services/gamificationService'
import { VALENCE_BY_NAME, AMPEL_COLORS, ampelForValence } from '../data/emotions'
import { AVATARS } from '../data/avatars'
import { calculateStreak } from '../utils/weekStats'
import { useT } from '../i18n/useT'
import './ProfilePage.css'

const WEEKDAY_LABELS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
const CHART_X = [10, 55, 100, 145, 190, 235, 285]
const CHART_TOP_Y = 12
const CHART_BOTTOM_Y = 56

function valenceToY(valence) {
  const clamped = Math.min(5, Math.max(1, valence))
  return CHART_BOTTOM_Y - ((clamped - 1) / 4) * (CHART_BOTTOM_Y - CHART_TOP_Y)
}

// Baut aus den rohen mood_logs-Einträgen die letzten 7 Tage (heute zuletzt),
// je Tag der Durchschnitt aller geloggten Stimmungen an diesem Tag.
function buildWeekChart(history) {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push({ key: d.toDateString(), label: WEEKDAY_LABELS[d.getDay()] })
  }

  const byDay = new Map()
  for (const entry of history) {
    const key = new Date(entry.created_at).toDateString()
    const valence = entry.valence ?? VALENCE_BY_NAME[entry.mood_name] ?? 3
    if (!byDay.has(key)) byDay.set(key, [])
    byDay.get(key).push(valence)
  }

  return days.map((day, i) => {
    const values = byDay.get(day.key)
    const avg = values ? values.reduce((a, b) => a + b, 0) / values.length : null
    return {
      label: day.label,
      x: CHART_X[i],
      y: avg === null ? null : valenceToY(avg),
      color: avg === null ? null : AMPEL_COLORS[ampelForValence(avg)],
    }
  })
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { mood, setMood } = useMood()
  const t = useT()
  const [moodPickerOpen, setMoodPickerOpen] = useState(false)
  const AMPEL_OPTIONS = [
    { id: 'green', label: t('profile.ampelGood') },
    { id: 'yellow', label: t('profile.ampelSoso') },
    { id: 'red', label: t('profile.ampelNeedHelp') },
  ]
  const [chartPoints, setChartPoints] = useState([])
  const [stats, setStats] = useState({ checkins: '–', avgMood: '–', streak: '–' })

  const [statusText, setStatusText] = useState('')
  const [statusColor, setStatusColor] = useState(null)
  const [painLevel, setPainLevel] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [saveError, setSaveError] = useState('')
  const [avatarUrl, setAvatarUrl] = useState(null)
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false)

  const [xp, setXp] = useState(0)
  const [unlockedAvatars, setUnlockedAvatars] = useState([])
  const [flipping, setFlipping] = useState(false)
  const [justWon, setJustWon] = useState(null)

  useEffect(() => {
    let active = true
    moodService
      .getHistory(user.id)
      .then((history) => {
        if (!active) return
        setChartPoints(buildWeekChart(history))

        const oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 6)
        oneWeekAgo.setHours(0, 0, 0, 0)
        const thisWeek = history.filter((e) => new Date(e.created_at) >= oneWeekAgo)

        const avgMood =
          thisWeek.length > 0
            ? (
                thisWeek.reduce((sum, e) => sum + (e.valence ?? VALENCE_BY_NAME[e.mood_name] ?? 3), 0) /
                thisWeek.length
              ).toFixed(1)
            : '–'

        setStats({
          checkins: String(thisWeek.length),
          avgMood,
          streak: String(calculateStreak(history)),
        })
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [user.id])

  useEffect(() => {
    let active = true
    profileService
      .getOwnProfile(user.id)
      .then((s) => {
        if (!active) return
        setStatusText(s.statusText)
        setStatusColor(s.statusColor)
        setPainLevel(s.painLevel ? Math.min(6, Math.round(s.painLevel)) : 0)
        setAvatarUrl(s.avatarUrl)
      })
      .catch(() => {})
    gamificationService
      .getProgress(user.id)
      .then((p) => {
        if (!active) return
        setXp(p.xp)
        setUnlockedAvatars(p.unlockedAvatars)
      })
      .catch((err) => console.error('XP konnte nicht geladen werden:', err.message))
    return () => {
      active = false
    }
  }, [user.id])

  // XP kommt ausschließlich aus dem täglichen Stimmungs-Check-in (siehe
  // HomePage.jsx/DailyMoodCheckin.jsx) – Status/Schmerzskala hier geben
  // bewusst keine eigene, zweite XP-Quelle mehr.
  async function saveStatus() {
    setSaving(true)
    setSaveMessage('')
    setSaveError('')
    try {
      await profileService.updateStatus(user.id, { statusText, statusColor, painLevel })
      setSaveMessage(t('profile.savedPlain'))
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (err) {
      // Vorher verschwand ein Fehlschlag komplett (nur console.error) – dabei
      // wurde der Status nicht tatsächlich gespeichert, ohne dass sichtbar
      // war, dass nichts passiert ist.
      console.error('Status konnte nicht gespeichert werden:', err.message)
      setSaveError(t('profile.saveError'))
    } finally {
      setSaving(false)
    }
  }

  async function pickAvatar(url) {
    setAvatarUrl(url)
    setAvatarPickerOpen(false)
    try {
      await profileService.updateAvatar(user.id, url)
    } catch {
      // stiller Fehlschlag reicht hier
    }
  }

  async function flipCard() {
    setFlipping(true)
    try {
      const won = await gamificationService.flipMysteryCard(user.id)
      if (won) {
        setUnlockedAvatars((prev) => [...prev, won.id])
        setJustWon(won)
        await pickAvatar(won.url)
      }
    } catch {
      // stiller Fehlschlag reicht hier
    } finally {
      setFlipping(false)
    }
  }

  const daysToNextAvatar = Math.max(0, Math.ceil((XP_PER_AVATAR - (xp % XP_PER_AVATAR)) / XP_PER_DAY))
  const allUnlocked = unlockedAvatars.length >= AVATARS.length

  const STATS = [
    { value: stats.checkins, label: t('profile.checkins') },
    { value: '3', label: t('profile.matches') },
    { value: stats.avgMood, label: t('profile.avgMood'), color: 'var(--green)' },
    { value: `${stats.streak} 🔥`, label: t('profile.streak') },
  ]

  return (
    <div className="fm-page">
      <div className="fm-topbar" style={{ justifyContent: 'space-between' }}>
        <span style={{ width: 38 }} />
        <span className="fm-topbar__title fm-topbar__title--xp">
          <Zap size={16} color="var(--yellow)" fill="var(--yellow)" /> {xp} XP
        </span>
        <button type="button" className="fm-btn fm-btn--icon" onClick={() => navigate('/settings')} aria-label={t('profile.settingsAria')}>
          <Settings size={18} />
        </button>
      </div>

      <div className="fm-profile__head">
        <div className="fm-profile__avatar-wrap">
          <button
            type="button"
            className="fm-profile__avatar-btn"
            onClick={() => setAvatarPickerOpen((v) => !v)}
            aria-label={t('profile.changeAvatar')}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="fm-profile__avatar-img" />
            ) : (
              <EmotionFace
                emoji="😊"
                background="linear-gradient(145deg,#ffd84a,#f9b500)"
                size={96}
                fontSize={44}
                style={{ border: '3px solid var(--surface)', boxShadow: 'var(--shadow-soft)' }}
              />
            )}
          </button>
          {statusText && <span className="fm-profile__status-bubble">{statusText}</span>}
        </div>
        <AmpelCircles options={AMPEL_OPTIONS} selected={statusColor} size={16} />
        <div className="fm-serif-title" style={{ fontSize: 26 }}>
          {user?.displayName || t('profile.anonymous')}
        </div>
        <div className="fm-profile__sub">{t('profile.safeSubtitle')}</div>

        {avatarPickerOpen && (
          <div style={{ width: '100%' }}>
            {unlockedAvatars.length === 0 ? (
              <div className="fm-mystery-card">
                <Sparkles size={28} color="var(--purple)" />
                <p className="fm-muted" style={{ margin: '8px 0 12px' }}>
                  {t('profile.mysteryHint')}
                </p>
                <Button variant="primary" onClick={flipCard} disabled={flipping}>
                  {flipping ? t('profile.flipping') : t('profile.flipCard')}
                </Button>
              </div>
            ) : (
              <>
                <div className="fm-avatar-grid">
                  {AVATARS.map((a) => {
                    const unlocked = unlockedAvatars.includes(a.id)
                    if (!unlocked) {
                      return (
                        <div key={a.id} className="fm-avatar-grid__item fm-avatar-grid__item--locked">
                          <Lock size={18} color="var(--text-faint)" />
                        </div>
                      )
                    }
                    return (
                      <button
                        key={a.id}
                        type="button"
                        className={`fm-avatar-grid__item ${avatarUrl === a.url ? 'is-selected' : ''} ${justWon?.id === a.id ? 'is-new' : ''}`}
                        onClick={() => pickAvatar(a.url)}
                      >
                        <img src={a.url} alt="" />
                      </button>
                    )
                  })}
                </div>
                {!allUnlocked && (
                  <p className="fm-muted" style={{ marginTop: 10, fontSize: 12 }}>
                    {t('profile.daysToNext', {
                      xp,
                      days: daysToNextAvatar,
                      dayLabel: t(daysToNextAvatar === 1 ? 'profile.day' : 'profile.days'),
                    })}
                  </p>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div style={{ marginBottom: 40 }}>
        <h2 className="fm-section-title" style={{ marginBottom: 12 }}>
          {t('profile.status')}
        </h2>
        <div className="fm-profile__status">
          <MessageCircle size={18} color="var(--text-faint)" />
          <input
            placeholder={t('profile.statusPlaceholder')}
            maxLength={60}
            value={statusText}
            onChange={(e) => setStatusText(e.target.value)}
          />
        </div>

        <div className="fm-field__label" style={{ marginTop: 14 }}>
          {t('profile.currentEmotion')} <span style={{ textTransform: 'none', fontWeight: 500 }}>({t('profile.notVisibleContacts')})</span>
        </div>
        <div className="fm-mood-row">
          <div className="fm-mood-row__current">
            <EmotionFace emoji={mood.emoji} background={mood.color} size={32} fontSize={16} />
            {t(`emotions.${mood.name}`)}
          </div>
          <button type="button" className="fm-mood-row__change" onClick={() => setMoodPickerOpen(true)}>
            {t('profile.changeEmotion')}
          </button>
        </div>

        <div className="fm-field__label" style={{ marginTop: 14 }}>
          {painLevel ? `${t('profile.painScale')}: ${painLevel}/6` : t('profile.painScaleOptional')}
        </div>
        <PainScale
          fullWidth
          value={painLevel || null}
          onSelect={(n) => {
            setPainLevel(n ?? 0)
            // Die Ampelfarbe hängt von der Emotion ab (angenehm/unangenehm),
            // nicht von der Intensitätszahl allein – sonst würde z.B. "Calma"
            // (angenehm) bei hoher Intensität fälschlich "brauche Hilfe" (rot)
            // vorschlagen, obwohl intensive Ruhe nichts Schlechtes ist.
            if (n) setStatusColor(ampelForValence(mood.valence ?? VALENCE_BY_NAME[mood.name] ?? 3))
          }}
        />

        <div className="fm-field__label" style={{ marginTop: 14 }}>
          {t('profile.howAreYou')}
        </div>
        <AmpelCircles options={AMPEL_OPTIONS} selected={statusColor} onSelect={setStatusColor} size={30} />
        <p className="fm-muted" style={{ fontSize: 12, marginTop: 4 }}>
          {AMPEL_OPTIONS.find((o) => o.id === statusColor)?.label ?? t('profile.notSelected')}
        </p>

        <Button variant="dark" onClick={saveStatus} disabled={saving} style={{ marginTop: 16, width: '100%' }}>
          {saveMessage ? <Check size={16} /> : null} {saveMessage || t('profile.save')}
        </Button>
        {saveError && (
          <p className="fm-auth__error" style={{ marginTop: 8 }}>
            {saveError}
          </p>
        )}
      </div>

      <MoodModal
        open={moodPickerOpen}
        onClose={() => setMoodPickerOpen(false)}
        onSelect={(emotion) => {
          setMood(emotion)
          setMoodPickerOpen(false)
        }}
        onDeepCheck={() => {
          setMoodPickerOpen(false)
          navigate('/panas')
        }}
      />

      <div className="fm-section-row">
        <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>{t('profile.stats')}</span>
        <span style={{ fontSize: 12, color: 'var(--text-faint)', fontWeight: 700 }}>{t('profile.thisWeek')}</span>
      </div>
      <div className="fm-stats-grid">
        {STATS.map((s) => (
          <div className="fm-stat-card" key={s.label}>
            <div className="fm-stat-card__value" style={{ color: s.color }}>
              {s.value}
            </div>
            <div className="fm-stat-card__label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', margin: '40px 0 12px' }}>{t('profile.moodChart')}</div>
      <div style={{ padding: '4px 2px 2px' }}>
        {chartPoints.some((p) => p.y !== null) ? (
          <svg viewBox="0 0 300 65" preserveAspectRatio="none" style={{ width: '100%', height: 65, display: 'block' }}>
            <polyline
              points={chartPoints
                .filter((p) => p.y !== null)
                .map((p) => `${p.x},${p.y}`)
                .join(' ')}
              fill="none"
              stroke="#7b5ea7"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {chartPoints
              .filter((p) => p.y !== null)
              .map((p) => (
                <circle key={p.x} cx={p.x} cy={p.y} r={4} fill={p.color} />
              ))}
          </svg>
        ) : (
          <p className="fm-muted" style={{ padding: '10px 0' }}>
            {t('profile.noEntries')}
          </p>
        )}
        <div className="fm-profile__weekdays">
          {chartPoints.map((p, i) => (
            <span key={i}>{p.label}</span>
          ))}
        </div>
      </div>

      <AvatarUnlockModal avatars={justWon ? [justWon] : []} onClose={() => setJustWon(null)} />
    </div>
  )
}
