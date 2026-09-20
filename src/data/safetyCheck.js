// Bewusst getrennt von der Emotions-Erkennung (panas.js): eine kurze
// Intensitäts-/Dauer-Nachfrage bei klar negativem Ergebnis, und nur wenn
// die auch hoch ausfällt, eine einzelne Sicherheitsfrage mit echten
// Hilfsangeboten. Antworten werden nirgends gespeichert (siehe
// PanasResultPage.jsx) – rein clientseitiger Zustand.

// Labels kommen aus den Übersetzungsdateien (safety.intensity*/duration*),
// siehe PanasResultPage.jsx – hier nur die stabilen IDs für Logik/Reihenfolge.
export const INTENSITY_OPTIONS = [
  { id: 'kaum', key: 'intensityKaum' },
  { id: 'mittel', key: 'intensityMittel' },
  { id: 'stark', key: 'intensityStark' },
  { id: 'sehr_stark', key: 'intensitySehrStark' },
]

export const DURATION_OPTIONS = [
  { id: 'heute', key: 'durationHeute' },
  { id: 'paar_tage', key: 'durationPaarTage' },
  { id: 'laenger', key: 'durationLaenger' },
]

// Schwelle bewusst vorsichtig gewählt (lieber einmal zu oft fragen als zu
// selten): "sehr stark" allein reicht schon, sonst "stark" + "schon länger".
export function isWarningSignal(intensity, duration) {
  if (intensity === 'sehr_stark') return true
  if (intensity === 'stark' && duration === 'laenger') return true
  return false
}

export const CRISIS_RESOURCES = {
  telefonseelsorgePhone: '0800 111 0 111',
  telefonseelsorgePhoneAlt: '0800 111 0 222',
  telefonseelsorgeTel: 'tel:08001110111',
  telefonseelsorgeUrl: 'https://www.telefonseelsorge.de',
  emergencyPhone: '112',
}
