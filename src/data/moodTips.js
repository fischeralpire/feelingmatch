// Ermittelt nur noch die passende Gefühlsfamilie (siehe data/emotions.js) –
// der eigentliche Erklärungs-/Tipp-Text liegt jetzt übersetzt in den
// i18n-Dateien unter "moodTips.<family>.why" / "moodTips.<family>.tip"
// (siehe useT()), damit er in jeder Sprache angezeigt wird statt fest auf
// Deutsch zu stehen. Bewusst auf Familien-Ebene statt pro Einzelemotion,
// damit der Inhalt pflegbar bleibt und trotzdem zur gewählten Stimmung passt.
const FALLBACK_BY_AMPEL = { green: 'freude', yellow: 'erwartung', red: 'trauer' }

const KNOWN_FAMILIES = new Set([
  'freude',
  'vertrauen',
  'angst',
  'ueberraschung',
  'trauer',
  'ekel',
  'wut',
  'erwartung',
  'mischgefuehle',
  'alltag',
])

export function resolveMoodTipFamily(mood) {
  if (mood?.family && KNOWN_FAMILIES.has(mood.family)) return mood.family
  const ampel = mood?.ampelColor ?? (mood?.valence >= 3.6 ? 'green' : mood?.valence >= 2.4 ? 'yellow' : 'red')
  return FALLBACK_BY_AMPEL[ampel] ?? 'alltag'
}
