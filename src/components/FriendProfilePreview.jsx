import { MessageCircle } from 'lucide-react'
import AvatarCircle from './AvatarCircle'
import Button from './Button'
import TrafficLight from './TrafficLight'
import { useT } from '../i18n/useT'
import './MoodModal.css'

// Öffnet sich beim Antippen des Avatars in der Freundesliste/Story-Leiste:
// größeres Foto + vollständiger Statustext, statt direkt in den Chat zu
// springen. Von hier aus kann man den Chat trotzdem mit einem Klick öffnen.
export default function FriendProfilePreview({ friend, onClose, onOpenChat }) {
  const t = useT()
  if (!friend) return null

  const ampelLabels = {
    green: t('friends.statusGood'),
    yellow: t('friends.statusSoso'),
    red: t('friends.statusNeedHelp'),
  }

  return (
    <div className="fm-modal-backdrop" onClick={onClose}>
      <div className="fm-modal-sheet" style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <div className="fm-modal-sheet__handle" />
        <AvatarCircle avatarUrl={friend.avatarUrl} name={friend.displayName} size={128} style={{ margin: '0 auto 14px', fontSize: 44 }} />
        <div className="fm-serif-title" style={{ fontSize: 24 }}>
          {friend.displayName}
        </div>

        {friend.statusColor && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginTop: 8,
              fontSize: 12,
              color: 'var(--text-faint)',
              fontWeight: 600,
            }}
          >
            <TrafficLight active={friend.statusColor} size={6} />
            {ampelLabels[friend.statusColor]}
          </div>
        )}

        <p className="fm-muted" style={{ margin: '14px 0 20px', lineHeight: 1.5 }}>
          {friend.statusText || t('friends.noStatus')}
        </p>

        {onOpenChat && (
          <Button variant="primary" onClick={onOpenChat}>
            <MessageCircle size={16} /> {t('friends.openChat')}
          </Button>
        )}
      </div>
    </div>
  )
}
