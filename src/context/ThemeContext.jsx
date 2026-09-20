import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { readValue, writeValue } from '../services/storage'

const ThemeContext = createContext(null)

// Dark Mode wurde auf Nutzerwunsch entfernt – die App läuft nur noch im
// hellen Design, data-theme bleibt fest auf 'light' (die dunklen CSS-Regeln
// unter :root[data-theme='dark'] werden dadurch nie mehr aktiv).
export function ThemeProvider({ children }) {
  const [accent, setAccent] = useState(() => readValue('theme-accent', 'yellow'))

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light')
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-accent', accent)
    writeValue('theme-accent', accent)
  }, [accent])

  const value = useMemo(() => ({ accent, setAccent }), [accent])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme muss innerhalb von <ThemeProvider> verwendet werden.')
  return ctx
}
