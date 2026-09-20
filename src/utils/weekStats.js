// Gemeinsame Wochen-/Streak-Berechnung für HomePage (Wochen-Kreise) und
// ProfilePage (Streak-Zahl) – ein Ort für die Logik, damit beide Stellen
// immer dieselbe Definition von "Serie" verwenden.
import { VALENCE_BY_NAME, AMPEL_COLORS, ampelForValence } from '../data/emotions'

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function startOfWeek(date) {
  const d = startOfDay(date)
  const mondayOffset = (d.getDay() + 6) % 7 // 0=Mo ... 6=So
  d.setDate(d.getDate() - mondayOffset)
  return d
}

// 7 Einträge Montag-Sonntag der aktuellen Kalenderwoche (nicht "letzte 7
// Tage") – passend zum Wochenkarten-Design, das den heutigen Tag markiert.
export function buildCurrentWeekDots(history, locale = 'de') {
  const monday = startOfWeek(new Date())
  const today = startOfDay(new Date())

  const byDay = new Map()
  for (const entry of history) {
    const key = startOfDay(entry.created_at).toDateString()
    const valence = entry.valence ?? VALENCE_BY_NAME[entry.mood_name] ?? 3
    if (!byDay.has(key)) byDay.set(key, [])
    byDay.get(key).push(valence)
  }

  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const values = byDay.get(d.toDateString())
    const avg = values ? values.reduce((a, b) => a + b, 0) / values.length : null
    days.push({
      label: d.toLocaleDateString(locale, { weekday: 'short' }).replace('.', ''),
      color: avg === null ? null : AMPEL_COLORS[ampelForValence(avg)],
      isToday: d.getTime() === today.getTime(),
      isFuture: d.getTime() > today.getTime(),
    })
  }
  return days
}

// Anzahl aufeinanderfolgender Tage mit mindestens einem Log, endend heute
// (oder gestern, falls heute noch nicht geloggt wurde).
export function calculateStreak(history) {
  const daysWithEntry = new Set(history.map((e) => startOfDay(e.created_at).toDateString()))
  const cursor = new Date()
  if (!daysWithEntry.has(cursor.toDateString())) {
    cursor.setDate(cursor.getDate() - 1)
  }
  let streak = 0
  while (daysWithEntry.has(cursor.toDateString())) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}
