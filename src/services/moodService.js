// Speichert jede Stimmungsangabe dauerhaft in `mood_logs` (siehe
// supabase/schema.sql), damit sich über die Zeit ein echter
// Stimmungsverlauf pro Person aufbaut statt nur einer Sitzungs-Variable.
import { supabase } from './supabaseClient'

function startOfTodayISO() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export const moodService = {
  async hasLoggedToday(userId) {
    const { data, error } = await supabase
      .from('mood_logs')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', startOfTodayISO())
      .limit(1)
    if (error) throw new Error(error.message)
    return data.length > 0
  },

  async logMood(userId, mood, source = 'manual', valence = null, intensity = null) {
    const { error } = await supabase
      .from('mood_logs')
      .insert({ user_id: userId, mood_name: mood.name, mood_emoji: mood.emoji, source, valence, intensity })
    if (error) throw new Error(error.message)
  },

  // days=365 entspricht dem "ein Jahr Verlauf"-Ziel; die Daten selbst
  // bleiben unbegrenzt gespeichert, das ist nur die Standard-Abfragegröße.
  async getHistory(userId, { days = 365 } = {}) {
    const since = new Date()
    since.setDate(since.getDate() - days)
    const { data, error } = await supabase
      .from('mood_logs')
      .select('mood_name, mood_emoji, source, valence, intensity, created_at')
      .eq('user_id', userId)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true })
    if (error) throw new Error(error.message)
    return data
  },
}
