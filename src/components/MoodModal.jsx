import { X, ClipboardList } from 'lucide-react'
import EmotionPicker from './EmotionPicker'
import HelpHint from './HelpHint'
import { useAuth } from '../context/AuthContext'
import { useT } from '../i18n/useT'
import './MoodModal.css'

export default function MoodModal({ open, onClose, onSelect, onDeepCheck }) {
  const { user } = useAuth()
  const t = useT()
  if (!open) return null

  return (
    <div className="fm-modal-backdrop" onClick={onClose}>
      <div className="fm-modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="fm-modal-sheet__handle" />
        <div className="fm-modal-sheet__header">
          <span className="fm-modal-sheet__title">{t('modal.allFeelings')}</span>
          <button type="button" className="fm-btn fm-btn--icon" onClick={onClose} aria-label={t('modal.close')}>
            <X size={16} />
          </button>
        </div>
        <p className="fm-modal-sheet__hint">{t('modal.hintMulti')}</p>

        <EmotionPicker userId={user?.id} onConfirm={(emotions) => onSelect(emotions)} />

        <button type="button" className="fm-modal-sheet__freetext" style={{ marginTop: 18 }} onClick={onDeepCheck}>
          <ClipboardList size={16} /> {t('modal.notSure')}
        </button>
        <HelpHint />
      </div>
    </div>
  )
}
