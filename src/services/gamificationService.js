// Freischalten der Avatar-Bilder als kleines Gamification-System:
// - Der erste Avatar wird per Zufall freigespielt ("verdeckte Karte
//   aufdecken", siehe flipMysteryCard).
// - Danach schaltet jeder weitere Kalendertag mit abgeschlossenem
//   Stimmungs-Check-in XP frei; ab genug XP schaltet der nächste Avatar in
//   der Liste automatisch frei (siehe awardCheckinXpIfNewDay).
//
// DAYS_PER_AVATAR=1: jeder Check-in-Tag schaltet direkt das nächste Bild
// frei (Motivation, täglich ein Gefühl einzutragen). Für eine langsamere
// Kadenz einfach hochsetzen, z.B. Math.round((365 * 0.5) / (AVATARS.length
// - 1)) ≈ 17 für "12 Monate, 50% der Tage".
import { supabase } from './supabaseClient'
import { AVATARS } from '../data/avatars'

export const XP_PER_DAY = 10
export const DAYS_PER_AVATAR = 1
export const XP_PER_AVATAR = XP_PER_DAY * DAYS_PER_AVATAR

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

// Wie viele Avatare sollten bei gegebener XP insgesamt freigeschaltet sein
// (die zufällig freigespielte Karte zählt nicht mit, die kommt obendrauf).
function sequentialUnlocksForXp(xp) {
  return Math.min(AVATARS.length - 1, Math.floor(xp / XP_PER_AVATAR))
}

export const gamificationService = {
  async getProgress(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('xp, unlocked_avatars, last_xp_awarded_on, last_checkin_xp_awarded_on')
      .eq('id', userId)
      .single()
    if (error) throw new Error(error.message)
    return {
      xp: data.xp ?? 0,
      unlockedAvatars: data.unlocked_avatars ?? [],
      lastXpAwardedOn: data.last_xp_awarded_on,
      lastCheckinXpAwardedOn: data.last_checkin_xp_awarded_on,
    }
  },

  // Einmalige Zufallsauswahl: gibt eine noch nicht freigeschaltete Avatar-ID
  // zurück und speichert sie direkt als freigeschaltet.
  async flipMysteryCard(userId) {
    const progress = await this.getProgress(userId)
    const locked = AVATARS.filter((a) => !progress.unlockedAvatars.includes(a.id))
    if (locked.length === 0) return null
    const won = locked[Math.floor(Math.random() * locked.length)]
    const nextUnlocked = [...progress.unlockedAvatars, won.id]
    const { error } = await supabase.from('profiles').update({ unlocked_avatars: nextUnlocked }).eq('id', userId)
    if (error) throw new Error(error.message)
    return won
  },

  // Gemeinsame Logik für jede XP-Quelle: XP draufrechnen, ggf. neue Avatare
  // in fester Reihenfolge freischalten (die zuvor per Zufall gewonnene Karte
  // wird dabei übersprungen), Spalte `dateColumn` als "heute erledigt"
  // markieren, damit dieselbe Quelle am selben Tag nicht doppelt zählt.
  async _awardXp(userId, progress, dateColumn, today) {
    const nextXp = progress.xp + XP_PER_DAY
    const targetSequentialCount = sequentialUnlocksForXp(nextXp)

    const stillLocked = AVATARS.filter((a) => !progress.unlockedAvatars.includes(a.id))
    const currentSequentialCount = Math.max(0, progress.unlockedAvatars.length - 1)
    const toUnlockCount = Math.max(0, targetSequentialCount - currentSequentialCount)
    const newlyUnlocked = stillLocked.slice(0, toUnlockCount)

    const nextUnlocked = [...progress.unlockedAvatars, ...newlyUnlocked.map((a) => a.id)]

    const { error } = await supabase
      .from('profiles')
      .update({ xp: nextXp, unlocked_avatars: nextUnlocked, [dateColumn]: today })
      .eq('id', userId)
    if (error) throw new Error(error.message)

    return { xpAwarded: XP_PER_DAY, newlyUnlocked, xp: nextXp }
  },

  // Beim Abschluss des täglichen Stimmungs-Check-ins aufrufen (siehe
  // DailyMoodCheckin.jsx/HomePage.jsx) – die einzige XP-Quelle der App,
  // maximal einmal pro Kalendertag.
  async awardCheckinXpIfNewDay(userId) {
    const progress = await this.getProgress(userId)
    const today = todayISO()
    if (progress.lastCheckinXpAwardedOn === today) {
      return { xpAwarded: 0, newlyUnlocked: [], xp: progress.xp }
    }
    return this._awardXp(userId, progress, 'last_checkin_xp_awarded_on', today)
  },

  // Zählt einen abgeschlossenen Check-in für das globale Zufalls-Sorteo (alle
  // Nutzer:innen zusammen, siehe supabase/schema.sql). Jeder 4. Aufruf
  // insgesamt markiert bei einer zufällig gezogenen Person
  // `pending_random_avatar` – das Popup dafür läuft in RandomAvatarModal.jsx,
  // unabhängig davon, wer hier gerade eingeloggt ist.
  async enterRandomRaffle() {
    const { error } = await supabase.rpc('register_checkin_and_maybe_award_random')
    if (error) throw new Error(error.message)
  },
}
