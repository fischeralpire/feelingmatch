import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { readValue, writeValue } from '../services/storage'

const LanguageContext = createContext(null)

export const LANGUAGES = [
  { id: 'de', label: 'Deutsch', dir: 'ltr' },
  { id: 'en', label: 'English', dir: 'ltr' },
  { id: 'es', label: 'Español', dir: 'ltr' },
  { id: 'ar', label: 'العربية', dir: 'rtl' },
  { id: 'it', label: 'Italiano', dir: 'ltr' },
  { id: 'ru', label: 'Русский', dir: 'ltr' },
  { id: 'uk', label: 'Українська', dir: 'ltr' },
  { id: 'tr', label: 'Türkçe', dir: 'ltr' },
  { id: 'pl', label: 'Polski', dir: 'ltr' },
]

// Gleiches Muster wie ThemeContext.jsx: localStorage-persistiert, setzt ein
// Attribut auf <html> (hier lang + dir, für Arabisch rechtsbündig).
export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => readValue('language', 'de'))

  useEffect(() => {
    const meta = LANGUAGES.find((l) => l.id === language) ?? LANGUAGES[0]
    document.documentElement.setAttribute('lang', meta.id)
    document.documentElement.setAttribute('dir', meta.dir)
    writeValue('language', language)
  }, [language])

  const value = useMemo(() => ({ language, setLanguage }), [language])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage muss innerhalb von <LanguageProvider> verwendet werden.')
  return ctx
}
