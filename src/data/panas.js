import { nearestEmotion, nearestEmotions } from './emotions'

// Kurzer, indirekter Gefühls-Check als Entscheidungsbaum: statt
// Gefühlswörtern direkt eine Intensität zuzuordnen (klassisches
// PANAS-Format, "wie sehr trifft 'interessiert' zu?" – schwer zu
// beantworten, wenn man sein Gefühl noch gar nicht kennt), fragen wir nach
// Körpergefühl, Energie, Gedanken und Situation. Jede Frage hat bewusst
// 3 Antworten statt 2 (inkl. einer mittigen/unsicheren Option), damit man
// nicht zu einer Extrem-Antwort gezwungen wird und sich das Ergebnis über
// den Verlauf noch verschieben kann, statt sich nach der ersten Antwort
// festzufahren. Knoten 1 grenzt die Valenz grob ein, Knoten 2 die
// Aktivierung innerhalb dieser Richtung (→ einer der 4
// Circumplex-Quadranten, oder bei "gemischt" ein eigener kurzer Zweig),
// Knoten 3 verfeinert innerhalb des Quadranten (bei einer mittigen Antwort
// übersprungen). Ab da laufen alle Zweige in eine gemeinsame Kette
// allgemeiner Verfeinerungsfragen, bis `next: null` das Ende markiert.
export const FEELING_CHECK_TREE = {
  start: 'valence',
  nodes: {
    valence: {
      question: 'Wie würdest du die letzten paar Stunden grob beschreiben?',
      options: [
        { label: 'Eher unangenehm', valence: -1, arousal: 0, next: 'arousalNeg' },
        { label: 'Gemischt / bin mir nicht sicher', valence: 0, arousal: 0, next: 'arousalMixed' },
        { label: 'Eher angenehm', valence: 1, arousal: 0, next: 'arousalPos' },
      ],
    },
    arousalMixed: {
      question: 'Ist gerade eher eine Mischung aus Anspannung und Ruhe da, oder fühlt es sich eher neutral/flau an?',
      options: [
        { label: 'Mix aus Anspannung und Ruhe', valence: 0, arousal: 0.4, next: 'gedanken' },
        { label: 'Eher neutral/flau, nichts Bestimmtes', valence: 0, arousal: -0.3, next: 'gedanken' },
      ],
    },
    arousalNeg: {
      question: 'Bist du dabei eher erschöpft & niedergeschlagen, oder eher aufgewühlt & angespannt?',
      options: [
        { label: 'Erschöpft & niedergeschlagen', valence: -0.3, arousal: -1, next: 'negLow' },
        { label: 'Ein bisschen von beidem', valence: -0.3, arousal: 0, next: 'gedanken' },
        { label: 'Aufgewühlt & angespannt', valence: -0.3, arousal: 1, next: 'negHigh' },
      ],
    },
    arousalPos: {
      question: 'Bist du dabei eher ruhig & zufrieden, oder eher aufgedreht & energiegeladen?',
      options: [
        { label: 'Ruhig & zufrieden', valence: 0.3, arousal: -1, next: 'posLow' },
        { label: 'Ein bisschen von beidem', valence: 0.3, arousal: 0, next: 'gedanken' },
        { label: 'Aufgedreht & energiegeladen', valence: 0.3, arousal: 1, next: 'posHigh' },
      ],
    },
    negLow: {
      question: 'Ist es eher, dass dich gerade etwas traurig macht, oder dass dir einfach die Energie fehlt?',
      options: [
        { label: 'Eher etwas Trauriges', valence: -0.6, arousal: -0.2, next: 'gedanken' },
        { label: 'Ein bisschen beides', valence: -0.4, arousal: -0.4, next: 'gedanken' },
        { label: 'Einfach keine Energie', valence: -0.2, arousal: -0.6, next: 'gedanken' },
      ],
    },
    negHigh: {
      question: 'Ist es eher Sorge/Angst vor etwas, oder eher Ärger über etwas?',
      options: [
        { label: 'Eher Sorge/Angst', valence: -0.6, arousal: 0.4, next: 'gedanken' },
        { label: 'Beides', valence: -0.5, arousal: 0.5, next: 'gedanken' },
        { label: 'Eher Ärger', valence: -0.4, arousal: 0.6, next: 'gedanken' },
      ],
    },
    posLow: {
      question: 'Ist es eher Zufriedenheit mit dem Moment, oder eher Dankbarkeit/Verbundenheit?',
      options: [
        { label: 'Zufriedenheit mit dem Moment', valence: 0.6, arousal: -0.4, next: 'gedanken' },
        { label: 'Beides zusammen', valence: 0.6, arousal: -0.25, next: 'gedanken' },
        { label: 'Dankbarkeit/Verbundenheit', valence: 0.6, arousal: -0.1, next: 'gedanken' },
      ],
    },
    posHigh: {
      question: 'Ist es eher Vorfreude auf etwas, oder eher pure Freude/Begeisterung gerade jetzt?',
      options: [
        { label: 'Vorfreude auf etwas', valence: 0.5, arousal: 0.6, next: 'gedanken' },
        { label: 'Beides', valence: 0.6, arousal: 0.65, next: 'gedanken' },
        { label: 'Pure Freude/Begeisterung', valence: 0.7, arousal: 0.7, next: 'gedanken' },
      ],
    },
    // Ab hier gemeinsame, quadrant-unabhängige Verfeinerung – jede Frage
    // hat weiterhin eine neutrale Mitte und kann das Ergebnis unabhängig
    // vom bisherigen Pfad noch in jede Richtung verschieben.
    gedanken: {
      question: 'Kreisen deine Gedanken gerade viel, oder ist eher Ruhe im Kopf?',
      options: [
        { label: 'Sie kreisen ziemlich', valence: -1, arousal: 0.6, next: 'atem' },
        { label: 'Geht so, mal mehr mal weniger', valence: 0, arousal: 0.1, next: 'atem' },
        { label: 'Eher Ruhe im Kopf', valence: 0.6, arousal: -0.6, next: 'atem' },
      ],
    },
    atem: {
      question: 'Ist dein Atem/Puls gerade eher schnell oder ruhig?',
      options: [
        { label: 'Eher schnell', valence: -0.2, arousal: 1, next: 'spannung' },
        { label: 'Mittendrin', valence: 0, arousal: 0.2, next: 'spannung' },
        { label: 'Eher ruhig', valence: 0.2, arousal: -1, next: 'spannung' },
      ],
    },
    spannung: {
      question: 'Sind deine Schultern oder dein Kiefer gerade eher verspannt oder entspannt?',
      options: [
        { label: 'Eher verspannt', valence: -0.6, arousal: 0.8, next: 'naehe' },
        { label: 'Teils teils', valence: 0, arousal: 0.1, next: 'naehe' },
        { label: 'Eher entspannt', valence: 0.6, arousal: -0.8, next: 'naehe' },
      ],
    },
    naehe: {
      question: 'Suchst du gerade eher Nähe zu anderen, oder willst du lieber deine Ruhe haben?',
      options: [
        { label: 'Eher meine Ruhe', valence: -0.4, arousal: -0.3, next: 'ausblick' },
        { label: 'Kommt drauf an, auf wen', valence: 0, arousal: 0, next: 'ausblick' },
        { label: 'Eher Nähe zu anderen', valence: 0.5, arousal: 0.2, next: 'ausblick' },
      ],
    },
    ausblick: {
      question: 'Blickst du gerade eher hoffnungsvoll nach vorne, oder machst du dir eher Sorgen?',
      options: [
        { label: 'Eher Sorgen', valence: -0.7, arousal: 0.3, next: 'reizbarkeit' },
        { label: 'Weiß noch nicht', valence: 0, arousal: 0, next: 'reizbarkeit' },
        { label: 'Eher hoffnungsvoll', valence: 0.6, arousal: 0.1, next: 'reizbarkeit' },
      ],
    },
    reizbarkeit: {
      question: 'Reagierst du gerade schneller genervt als sonst, oder eher gelassen?',
      options: [
        { label: 'Schneller genervt', valence: -1, arousal: 0.7, next: 'vergleich' },
        { label: 'Weder noch, so wie sonst auch', valence: 0, arousal: 0, next: 'vergleich' },
        { label: 'Eher gelassen', valence: 0.7, arousal: -0.5, next: 'vergleich' },
      ],
    },
    vergleich: {
      question: 'Vergleichst du dich in Gedanken gerade öfter mit anderen, oder bist du eher bei dir selbst?',
      options: [
        { label: 'Öfter mit anderen', valence: -0.5, arousal: 0.3, next: null },
        { label: 'Teils teils', valence: 0, arousal: 0, next: null },
        { label: 'Eher bei mir selbst', valence: 0.4, arousal: -0.2, next: null },
      ],
    },
  },
}

// Rein visuelle Referenzlänge für die Fortschrittsanzeige – der Baum ist
// unterschiedlich lang, je nach Zweig, daher keine feste Gesamtzahl.
export const TYPICAL_STEPS = 10

// Reichert eine gewählte Option um den größtmöglichen Ausschlag an genau
// diesem Knoten an (max(|valence|) / max(|arousal|) der beiden Optionen) –
// macht evaluateFeelingCheck unabhängig davon, wie viele/welche Fragen
// tatsächlich beantwortet wurden (nötig für den Baum + die Live-Vorschau).
export function buildAnswerEntry(node, option) {
  const maxValence = Math.max(...node.options.map((o) => Math.abs(o.valence)))
  const maxArousal = Math.max(...node.options.map((o) => Math.abs(o.arousal)))
  return { valence: option.valence, arousal: option.arousal, maxValence, maxArousal }
}

function clamp15(value) {
  return Math.min(5, Math.max(1, value))
}

// answers: Array angereicherter Einträge (siehe buildAnswerEntry), eine pro
// bisher beantworteter Frage – funktioniert für jede Anzahl/Reihenfolge,
// daher sowohl für das Endergebnis als auch für die Live-Vorschau ab Frage
// 3 nutzbar. Ordnet die normalisierte Position der nächstgelegenen Emotion
// aus der Taxonomie zu (nearestEmotion, unverändert).
export function evaluateFeelingCheck(answers) {
  const valenceSum = answers.reduce((sum, a) => sum + a.valence, 0)
  const arousalSum = answers.reduce((sum, a) => sum + a.arousal, 0)
  const maxValenceSum = answers.reduce((sum, a) => sum + a.maxValence, 0) || 1
  const maxArousalSum = answers.reduce((sum, a) => sum + a.maxArousal, 0) || 1

  const valence = clamp15(3 + (valenceSum / maxValenceSum) * 2)
  const arousal = clamp15(3 + (arousalSum / maxArousalSum) * 2)

  const matched = nearestEmotion(valence, arousal)

  return { valence, arousal, matched }
}

// Live-Vorschläge für die "Passt das schon?"-Chips ab Frage 3.
export function suggestEmotions(answers, n = 3) {
  const { valence, arousal } = evaluateFeelingCheck(answers)
  return nearestEmotions(valence, arousal, n)
}
