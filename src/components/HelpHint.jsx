import { CRISIS_RESOURCES } from '../data/safetyCheck'
import { useT } from '../i18n/useT'

// Kleiner, unaufdringlicher Dauer-Hinweis: diese App ersetzt keine
// professionelle Hilfe. Wird an mehreren Stellen rund um Gefühls-Auswahl/
// -Check gezeigt (MoodModal, DailyMoodCheckin, PanasResultPage) – bewusst
// immer sichtbar, nicht nur wenn ein Warnsignal erkannt wurde (siehe
// data/safetyCheck.js für den ausführlichen Krisen-Block).
export default function HelpHint() {
  const t = useT()
  const [before, after] = t('help.hint', { phone: '__PHONE__' }).split('__PHONE__')
  return (
    <p className="fm-help-hint">
      {before}
      <a href={CRISIS_RESOURCES.telefonseelsorgeTel}>{CRISIS_RESOURCES.telefonseelsorgePhone}</a>
      {after}
    </p>
  )
}
