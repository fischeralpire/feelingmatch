// Umfassende Emotions-Taxonomie, bewusst auf einem etablierten
// psychologischen Modell aufgebaut statt frei erfunden:
//
// - 8 Grundfamilien + je 3 Intensitätsstufen nach Robert Plutchiks "Wheel
//   of Emotions" (Plutchik, 1980) – z.B. Gelassenheit → Freude → Ekstase.
// - 8 "Mischgefühle" = Plutchiks Dyaden (Kombination zweier Nachbar-
//   Grundgefühle, z.B. Freude+Vertrauen = Liebe).
// - "Alltagsgefühle": zusätzliche, sehr häufig gesuchte Begriffe, die in
//   Plutchiks Modell nicht als eigene Kategorie vorkommen (z.B. Scham,
//   Einsamkeit, Überforderung), damit die Suche in der Praxis mehr trifft.
//
// valence (1 = sehr unangenehm … 5 = sehr angenehm) und arousal
// (1 = sehr ruhig/energiearm … 5 = sehr aufgewühlt/energiegeladen) spannen
// den "Circumplex of Affect" auf (Russell, 1980) – das wird im PANAS-
// Fragebogen genutzt, um aus den Antworten die nächstliegende Emotion
// dieser Liste zu bestimmen (siehe data/panas.js).
export const EMOTION_FAMILIES = [
  { id: 'freude', label: 'Freude' },
  { id: 'vertrauen', label: 'Vertrauen' },
  { id: 'angst', label: 'Angst' },
  { id: 'ueberraschung', label: 'Überraschung' },
  { id: 'trauer', label: 'Trauer' },
  { id: 'ekel', label: 'Ekel' },
  { id: 'wut', label: 'Wut' },
  { id: 'erwartung', label: 'Erwartung' },
  { id: 'mischgefuehle', label: 'Mischgefühle' },
  { id: 'alltag', label: 'Alltagsgefühle' },
]

export const EMOTIONS = [
  // ── Freude-Familie ──────────────────────────────────────────────────
  { name: 'Gelassenheit', emoji: '😌', color: '#fef0b0', family: 'freude', valence: 4, arousal: 2, featured: true },
  { name: 'Freude', emoji: '😊', color: '#fef0b0', family: 'freude', valence: 5, arousal: 4, featured: true },
  { name: 'Ekstase', emoji: '🤩', color: '#fef0b0', family: 'freude', valence: 5, arousal: 5 },

  // ── Vertrauen-Familie ───────────────────────────────────────────────
  { name: 'Akzeptanz', emoji: '🙂', color: '#e0f7ee', family: 'vertrauen', valence: 4, arousal: 2, synonyms: ['zufrieden'] },
  { name: 'Vertrauen', emoji: '🤝', color: '#e0f7ee', family: 'vertrauen', valence: 4, arousal: 2.5 },
  { name: 'Bewunderung', emoji: '🥰', color: '#e0f7ee', family: 'vertrauen', valence: 5, arousal: 3 },

  // ── Angst-Familie ───────────────────────────────────────────────────
  { name: 'Besorgnis', emoji: '😟', color: '#e3f2e0', family: 'angst', valence: 2, arousal: 3, synonyms: ['unruhig'] },
  { name: 'Angst', emoji: '😨', color: '#e3f2e0', family: 'angst', valence: 1.5, arousal: 4.5, synonyms: ['nervös'], featured: true },
  { name: 'Schrecken', emoji: '😱', color: '#e3f2e0', family: 'angst', valence: 1, arousal: 5 },

  // ── Überraschung-Familie ────────────────────────────────────────────
  { name: 'Ablenkung', emoji: '😵‍💫', color: '#e0f4f7', family: 'ueberraschung', valence: 3, arousal: 3 },
  { name: 'Überraschung', emoji: '😲', color: '#e0f4f7', family: 'ueberraschung', valence: 3.5, arousal: 4.5 },
  { name: 'Verblüffung', emoji: '🫨', color: '#e0f4f7', family: 'ueberraschung', valence: 3, arousal: 5 },

  // ── Trauer-Familie ──────────────────────────────────────────────────
  { name: 'Nachdenklichkeit', emoji: '😔', color: '#e0e8ff', family: 'trauer', valence: 2.5, arousal: 2 },
  { name: 'Traurigkeit', emoji: '😢', color: '#e0e8ff', family: 'trauer', valence: 1.5, arousal: 1.5, featured: true },
  { name: 'Verzweiflung', emoji: '😭', color: '#e0e8ff', family: 'trauer', valence: 1, arousal: 2 },

  // ── Ekel-Familie ────────────────────────────────────────────────────
  { name: 'Langeweile', emoji: '😑', color: '#efe3f7', family: 'ekel', valence: 2, arousal: 1.5 },
  { name: 'Ekel', emoji: '🤢', color: '#efe3f7', family: 'ekel', valence: 1.5, arousal: 3 },
  { name: 'Abscheu', emoji: '🤮', color: '#efe3f7', family: 'ekel', valence: 1, arousal: 3.5 },

  // ── Wut-Familie ─────────────────────────────────────────────────────
  { name: 'Ärger', emoji: '😠', color: '#ffe0e0', family: 'wut', valence: 2, arousal: 3.5, synonyms: ['genervt', 'frustriert'] },
  { name: 'Wut', emoji: '😡', color: '#ffe0e0', family: 'wut', valence: 1.5, arousal: 4.5, featured: true },
  { name: 'Zorn', emoji: '🤬', color: '#ffe0e0', family: 'wut', valence: 1, arousal: 5 },

  // ── Erwartung-Familie ───────────────────────────────────────────────
  { name: 'Interesse', emoji: '🧐', color: '#ffe8cc', family: 'erwartung', valence: 3.5, arousal: 3 },
  { name: 'Vorfreude', emoji: '😃', color: '#ffe8cc', family: 'erwartung', valence: 4, arousal: 3.5, synonyms: ['aufgeregt'] },
  { name: 'Wachsamkeit', emoji: '👀', color: '#ffe8cc', family: 'erwartung', valence: 3, arousal: 4 },

  // ── Mischgefühle (Plutchik-Dyaden) ──────────────────────────────────
  { name: 'Liebe', emoji: '❤️', color: '#ffe0ee', family: 'mischgefuehle', valence: 5, arousal: 3.5, featured: true },
  { name: 'Verletzlichkeit', emoji: '🥺', color: '#ffe0ee', family: 'mischgefuehle', valence: 2.5, arousal: 3 },
  { name: 'Ehrfurcht', emoji: '😳', color: '#ffe0ee', family: 'mischgefuehle', valence: 3, arousal: 4 },
  { name: 'Enttäuschung', emoji: '😞', color: '#ffe0ee', family: 'mischgefuehle', valence: 1.5, arousal: 2 },
  { name: 'Reue', emoji: '😖', color: '#ffe0ee', family: 'mischgefuehle', valence: 1.5, arousal: 2.5 },
  { name: 'Verachtung', emoji: '😤', color: '#ffe0ee', family: 'mischgefuehle', valence: 1.5, arousal: 3.5 },
  { name: 'Aggression', emoji: '😾', color: '#ffe0ee', family: 'mischgefuehle', valence: 1.5, arousal: 4.5 },
  { name: 'Optimismus', emoji: '🌟', color: '#ffe0ee', family: 'mischgefuehle', valence: 4.5, arousal: 3.5 },

  // ── Alltagsgefühle ──────────────────────────────────────────────────
  { name: 'Stolz', emoji: '😌', color: '#f2e9ff', family: 'alltag', valence: 4.5, arousal: 3.5 },
  { name: 'Scham', emoji: '😳', color: '#f2e9ff', family: 'alltag', valence: 1.5, arousal: 2.5 },
  { name: 'Dankbarkeit', emoji: '🙏', color: '#f2e9ff', family: 'alltag', valence: 5, arousal: 2.5 },
  { name: 'Einsamkeit', emoji: '🥺', color: '#f2e9ff', family: 'alltag', valence: 1.5, arousal: 1.5 },
  { name: 'Erschöpfung', emoji: '😴', color: '#f2e9ff', family: 'alltag', valence: 2, arousal: 1, synonyms: ['müde', 'müdigkeit'], featured: true },
  { name: 'Überforderung', emoji: '😵', color: '#f2e9ff', family: 'alltag', valence: 1.5, arousal: 4, featured: true },
  { name: 'Eifersucht', emoji: '😒', color: '#f2e9ff', family: 'alltag', valence: 1.5, arousal: 3.5 },
  { name: 'Neid', emoji: '🙄', color: '#f2e9ff', family: 'alltag', valence: 2, arousal: 2.5 },
  { name: 'Hoffnung', emoji: '🌤️', color: '#f2e9ff', family: 'alltag', valence: 4, arousal: 3 },
]

// Schneller Name -> Valenz-Lookup, z.B. für den Stimmungsverlauf im Profil.
export const VALENCE_BY_NAME = Object.fromEntries(EMOTIONS.map((e) => [e.name, e.valence]))

// Kuratierte Auswahl für die Instagram-Stories-artige Schnellauswahl auf der
// Startseite – ein Ausschnitt aus mehreren Familien statt der vollen Liste.
export const FEATURED_EMOTIONS = EMOTIONS.filter((e) => e.featured)

// Ampel-Einordnung (grün/gelb/rot) einer Emotion anhand ihrer Valenz – für
// den kleinen Farbpunkt auf den Emotion-Kacheln und im Stimmungsverlauf.
// Manuell gesetzte Ampelfarben (z.B. der Freundes-Status) sind bewusst
// getrennt davon, siehe profileService.js.
export const AMPEL_COLORS = {
  green: '#19be6f',
  yellow: '#f9c623',
  red: '#ff5c6e',
}

// Helle Hintergrundfarben je Ampel – für die EmotionFace-Kachel eigener
// Emotionen (die keine kuratierte Pastellfarbe wie EMOTIONS haben).
export const AMPEL_LIGHT = {
  green: '#e0f7ee',
  yellow: '#fff6d9',
  red: '#ffe0e0',
}

// Umkehrung von ampelForValence: ein grober, repräsentativer Valenz-Wert je
// Ampelfarbe, damit eigene Emotionen (nur mit Ampel-Farbe, ohne Valenz)
// trotzdem im Circumplex/Wochenchart einsortiert werden können.
export const AMPEL_MIDPOINT_VALENCE = {
  green: 4.3,
  yellow: 3,
  red: 1.7,
}

export function ampelForValence(valence) {
  if (valence >= 3.6) return 'green'
  if (valence >= 2.4) return 'yellow'
  return 'red'
}

export function searchEmotions(query, familyId) {
  const q = query.trim().toLowerCase()
  return EMOTIONS.filter((e) => {
    if (familyId && e.family !== familyId) return false
    if (!q) return true
    if (e.name.toLowerCase().includes(q)) return true
    return (e.synonyms ?? []).some((s) => s.toLowerCase().includes(q))
  })
}

// Findet die n Emotionen, deren (valence, arousal) am nächsten am gegebenen
// Punkt liegen (euklidischer Abstand im Circumplex-Raum), sortiert nach
// Nähe. Wird für den finalen Treffer (n=1) und für die Live-Vorschläge im
// Gefühls-Check (n=3, siehe data/panas.js) genutzt.
export function nearestEmotions(valence, arousal, n = 1) {
  return [...EMOTIONS]
    .sort((a, b) => {
      const distA = (a.valence - valence) ** 2 + (a.arousal - arousal) ** 2
      const distB = (b.valence - valence) ** 2 + (b.arousal - arousal) ** 2
      return distA - distB
    })
    .slice(0, n)
}

export function nearestEmotion(valence, arousal) {
  return nearestEmotions(valence, arousal, 1)[0]
}
