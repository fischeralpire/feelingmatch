import { useState } from 'react'
import { Home, Search, MessageCircle, User } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useT } from '../i18n/useT'

export default function BottomNav() {
  const t = useT()
  const location = useLocation()
  const navigate = useNavigate()
  const [pendingTo, setPendingTo] = useState(null)
  const isSearching = location.pathname === '/search'

  const ITEMS = [
    { to: '/home', label: t('nav.home'), icon: Home },
    { to: '/match', label: t('nav.match'), icon: Search },
    { to: '/friends', label: t('nav.friends'), icon: MessageCircle },
    { to: '/profile', label: t('nav.profile'), icon: User },
  ]

  function handleClick(e, to) {
    if (isSearching && to !== location.pathname) {
      e.preventDefault()
      setPendingTo(to)
    }
  }

  return (
    <>
      <nav className="fm-bottom-nav">
        {ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `fm-nav-btn ${isActive ? 'is-active' : ''}`}
            onClick={(e) => handleClick(e, to)}
          >
            <Icon size={20} strokeWidth={2.2} />
            {label}
          </NavLink>
        ))}
      </nav>

      {pendingTo && (
        <div className="fm-confirm-backdrop" onClick={() => setPendingTo(null)}>
          <div className="fm-confirm-card" onClick={(e) => e.stopPropagation()}>
            <p className="fm-confirm-card__title">{t('nav.leaveMatchTitle')}</p>
            <p className="fm-confirm-card__text">{t('nav.leaveMatchBody')}</p>
            <div className="fm-confirm-card__actions">
              <button type="button" className="fm-confirm-card__btn" onClick={() => setPendingTo(null)}>
                {t('nav.leaveMatchCancel')}
              </button>
              <button
                type="button"
                className="fm-confirm-card__btn fm-confirm-card__btn--primary"
                onClick={() => {
                  const to = pendingTo
                  setPendingTo(null)
                  navigate(to)
                }}
              >
                {t('nav.leaveMatchConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
