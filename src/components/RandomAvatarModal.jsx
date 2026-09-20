import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { profileService } from '../services/profileService'
import { useT } from '../i18n/useT'
import './RandomAvatarModal.css'

// Popup für das globale Zufalls-Sorteo (siehe gamificationService.enterRandomRaffle
// und supabase.sql: register_checkin_and_maybe_award_random). Läuft app-weit in
// AppLayout, weil die gewinnende Person eine völlig andere sein kann als die,
// die gerade den 4. Check-in ausgelöst hat.
export default function RandomAvatarModal() {
  const { user } = useAuth()
  const t = useT()
  const [pending, setPending] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    profileService
      .getOwnProfile(user.id)
      .then((p) => active && setPending(p.pendingRandomAvatar))
      .catch(() => {})
    return () => {
      active = false
    }
  }, [user.id])

  if (!pending) return null

  const imageUrl = `/random/${pending}`

  async function claim() {
    setSaving(true)
    try {
      await profileService.updateAvatar(user.id, imageUrl)
      await profileService.clearPendingRandomAvatar(user.id)
      setPending(null)
    } catch (err) {
      console.error('Zufalls-Avatar konnte nicht übernommen werden:', err.message)
    } finally {
      setSaving(false)
    }
  }

  async function dismiss() {
    try {
      await profileService.clearPendingRandomAvatar(user.id)
    } catch (err) {
      console.error('Zufalls-Avatar konnte nicht verworfen werden:', err.message)
    }
    setPending(null)
  }

  return (
    <div className="fm-random-backdrop">
      <div className="fm-random-card">
        <div className="fm-random-card__glow" />
        <Sparkles size={20} className="fm-random-card__sparkle fm-random-card__sparkle--1" />
        <Sparkles size={14} className="fm-random-card__sparkle fm-random-card__sparkle--2" />
        <Sparkles size={16} className="fm-random-card__sparkle fm-random-card__sparkle--3" />
        <img src={imageUrl} alt="" className="fm-random-card__img" />
        <h2 className="fm-serif-hero fm-random-card__title">{t('randomAvatar.title')}</h2>
        <p className="fm-muted fm-random-card__text">{t('randomAvatar.text')}</p>
        <button type="button" className="fm-btn fm-btn--dark fm-random-card__claim" onClick={claim} disabled={saving}>
          {t('randomAvatar.claim')}
        </button>
        <button type="button" className="fm-random-card__skip" onClick={dismiss} disabled={saving}>
          {t('randomAvatar.skip')}
        </button>
      </div>
    </div>
  )
}
