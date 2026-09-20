import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    authService.getSession().then((sessionUser) => {
      if (active) {
        setUser(sessionUser)
        setLoading(false)
      }
    })
    const unsubscribe = authService.subscribe((nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })
    return () => {
      active = false
      unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      loading,
      login: (payload) => authService.login(payload),
      register: (payload) => authService.register(payload),
      continueAsGuest: () => authService.continueAsGuest(),
      logout: () => authService.logout(),
      sendMagicLink: (email) => authService.sendMagicLink(email),
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth muss innerhalb von <AuthProvider> verwendet werden.')
  return ctx
}
