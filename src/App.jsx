import { Navigate, Route, Routes } from 'react-router-dom'
import useParallax from './hooks/useParallax'
import { useAuth } from './context/AuthContext'
import AppLayout from './layout/AppLayout'
import BackgroundLayer from './components/BackgroundLayer'
import SplashPage from './pages/SplashPage'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import MatchPage from './pages/MatchPage'
import SearchPage from './pages/SearchPage'
import FoundPage from './pages/FoundPage'
import ChatPage from './pages/ChatPage'
import FriendsPage from './pages/FriendsPage'
import AddFriendPage from './pages/AddFriendPage'
import FriendChatPage from './pages/FriendChatPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import PanasPage from './pages/PanasPage'
import PanasResultPage from './pages/PanasResultPage'

function LoadingScreen() {
  return (
    <div className="fm-shell">
      <div className="fm-page fm-page--centered">
        <p className="fm-muted">Lädt…</p>
      </div>
    </div>
  )
}

function RequireAuth({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (!isAuthenticated) return <Navigate to="/welcome" replace />
  return children
}

// Wer schon eine gültige Sitzung hat, soll Splash/Login/Register nicht erneut
// sehen, sondern direkt zur Startseite kommen.
function RedirectIfAuthenticated({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <LoadingScreen />
  if (isAuthenticated) return <Navigate to="/home" replace />
  return children
}

export default function App() {
  useParallax()

  return (
    <>
      <BackgroundLayer />
      <Routes>
        <Route
          path="/welcome"
          element={
            <RedirectIfAuthenticated>
              <SplashPage />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/register"
          element={
            <RedirectIfAuthenticated>
              <RegisterPage />
            </RedirectIfAuthenticated>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectIfAuthenticated>
              <LoginPage />
            </RedirectIfAuthenticated>
          }
        />

        <Route
          element={
            <RequireAuth>
              <AppLayout />
            </RequireAuth>
          }
        >
          <Route path="/home" element={<HomePage />} />
          <Route path="/match" element={<MatchPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/found" element={<FoundPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/friends/add" element={<AddFriendPage />} />
          <Route path="/friends/:friendId" element={<FriendChatPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/panas" element={<PanasPage />} />
          <Route path="/panasresult" element={<PanasResultPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/welcome" replace />} />
      </Routes>
    </>
  )
}
