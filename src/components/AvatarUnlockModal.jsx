import { PartyPopper } from 'lucide-react'
import { useT } from '../i18n/useT'
import './AvatarUnlockModal.css'

// Feiert einen "normalen" Avatar-Fortschritt: täglicher XP-Meilenstein
// (HomePage.jsx, sequentielle Freischaltung) oder die einmalige Mystery-Card
// (ProfilePage.jsx flipCard). Bewusst schlichter gehalten als
// RandomAvatarModal (kein Glow/Funkeln) – der Kontrast macht den seltenen
// Zufalls-Gewinn im Vergleich spürbar besonderer.
export default function AvatarUnlockModal({ avatars, onClose }) {
  const t = useT()
  if (!avatars || avatars.length === 0) return null

  return (
    <div className="fm-avatarunlock-backdrop" onClick={onClose}>
      <div className="fm-avatarunlock-card" onClick={(e) => e.stopPropagation()}>
        <div className="fm-avatarunlock-card__icon">
          <PartyPopper size={26} color="var(--accent-fg)" />
        </div>
        <div className="fm-avatarunlock-card__images">
          {avatars.map((a) => (
            <img key={a.id} src={a.url} alt="" className="fm-avatarunlock-card__img" />
          ))}
        </div>
        <h2 className="fm-serif-hero fm-avatarunlock-card__title">
          {avatars.length > 1 ? t('avatarUnlock.titlePlural') : t('avatarUnlock.title')}
        </h2>
        <p className="fm-muted fm-avatarunlock-card__text">
          {avatars.length > 1 ? t('avatarUnlock.textPlural', { n: avatars.length }) : t('avatarUnlock.text')}
        </p>
        <button type="button" className="fm-btn fm-btn--dark fm-avatarunlock-card__close" onClick={onClose}>
          {t('avatarUnlock.close')}
        </button>
      </div>
    </div>
  )
}
