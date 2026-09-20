import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from './Button'
import { useT } from '../i18n/useT'

// Ersetzt die alte Handy-Statusleiste: nur noch Zurück-Button + optionaler
// Titel/Slot rechts. Kein Fake-Signal/Akku-Icon mehr nötig, da kein Phone-Frame.
export default function TopBar({ back, title, right }) {
  const navigate = useNavigate()
  const t = useT()

  return (
    <div className="fm-topbar">
      {back ? (
        <Button variant="pill" onClick={() => (typeof back === 'string' ? navigate(back) : navigate(-1))}>
          <ArrowLeft size={16} /> {t('common.back')}
        </Button>
      ) : (
        <span />
      )}
      {title && <span className="fm-topbar__title">{title}</span>}
      {right ?? <span />}
    </div>
  )
}
