import { Check } from 'lucide-react'
import { LANGUAGES, useLanguage } from '../context/LanguageContext'

// Liste aller 9 Sprachen zum Antippen – wiederverwendet in SettingsPage
// (aufklappbares Panel) und SplashPage (kleines Auswahl-Sheet).
export default function LanguagePicker({ onSelect }) {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="fm-language-picker">
      {LANGUAGES.map((l) => (
        <button
          key={l.id}
          type="button"
          className={`fm-language-picker__item ${language === l.id ? 'is-active' : ''}`}
          onClick={() => {
            setLanguage(l.id)
            onSelect?.(l.id)
          }}
        >
          <span>{l.label}</span>
          {language === l.id && <Check size={16} />}
        </button>
      ))}
    </div>
  )
}
