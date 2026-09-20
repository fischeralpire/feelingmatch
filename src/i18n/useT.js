import { useCallback } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { TRANSLATIONS } from './translations'

function lookup(dict, path) {
  return path.split('.').reduce((acc, key) => (acc && typeof acc === 'object' ? acc[key] : undefined), dict)
}

function interpolate(str, vars) {
  if (!vars) return str
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => (vars[key] !== undefined ? String(vars[key]) : `{{${key}}}`))
}

// Einfacher Punkt-Pfad-Lookup ("common.back") + {{var}}-Interpolation.
// Fällt auf Deutsch zurück, wenn ein Key in der aktuellen Sprache fehlt,
// und auf den Key selbst, falls er auch dort fehlt (macht fehlende
// Übersetzungen sofort sichtbar statt sie zu verschlucken).
export function useT() {
  const { language } = useLanguage()

  return useCallback(
    (path, vars) => {
      const value =
        lookup(TRANSLATIONS[language], path) ?? lookup(TRANSLATIONS.de, path) ?? path
      return typeof value === 'string' ? interpolate(value, vars) : value
    },
    [language],
  )
}
