import { Outlet, useLocation } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import RandomAvatarModal from '../components/RandomAvatarModal'

// Screens ohne eigenen "fullscreen"-Anspruch bekommen die untere Navigation.
const WITH_NAV = ['/home', '/match', '/search', '/friends', '/profile', '/panas', '/panasresult']

export default function AppLayout() {
  const location = useLocation()
  const showNav = WITH_NAV.includes(location.pathname)

  return (
    <div className="fm-shell">
      <Outlet />
      {showNav && <BottomNav />}
      {/* App-weit, nicht an eine Seite gebunden: die gewinnende Person beim
          Zufalls-Sorteo kann irgendwo in der App sein, nicht nur auf Home. */}
      <RandomAvatarModal />
    </div>
  )
}
