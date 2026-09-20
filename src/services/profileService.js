// Status/Ampel/Schmerzskala/Avatar des eigenen Profils. Bewusst getrennt von
// authService (Login) und friendsService (Beziehungen) – hier geht es nur
// um die eigenen, für Freunde sichtbaren Felder in `profiles`.
import { supabase } from './supabaseClient'

export const profileService = {
  async updateStatus(userId, { statusText, statusColor, painLevel }) {
    const { error } = await supabase
      .from('profiles')
      .update({
        status_text: statusText || null,
        status_color: statusColor || null,
        pain_level: painLevel ?? null,
        status_updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
    if (error) throw new Error(error.message)
  },

  // Aktualisiert nur die Intensitäts-/Belastungsskala (1-6) des Profils,
  // ohne Statustext/-farbe anzufassen – z.B. vom täglichen Check-in aus
  // (DailyMoodCheckin.jsx), der dieselbe Frage wie profile.painScale stellt.
  async updatePainLevel(userId, painLevel) {
    const { error } = await supabase
      .from('profiles')
      .update({ pain_level: painLevel ?? null, status_updated_at: new Date().toISOString() })
      .eq('id', userId)
    if (error) throw new Error(error.message)
  },

  async updateAvatar(userId, avatarUrl) {
    const { error } = await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', userId)
    if (error) throw new Error(error.message)
  },

  async getOwnProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('status_text, status_color, pain_level, status_updated_at, avatar_url, pending_random_avatar')
      .eq('id', userId)
      .single()
    if (error) throw new Error(error.message)
    return {
      statusText: data.status_text ?? '',
      statusColor: data.status_color,
      painLevel: data.pain_level,
      updatedAt: data.status_updated_at,
      avatarUrl: data.avatar_url,
      pendingRandomAvatar: data.pending_random_avatar,
    }
  },

  // Räumt das Zufalls-Sorteo-Popup weg (siehe RandomAvatarModal.jsx), egal ob
  // die Person das Bild übernommen oder abgelehnt hat.
  async clearPendingRandomAvatar(userId) {
    const { error } = await supabase.from('profiles').update({ pending_random_avatar: null }).eq('id', userId)
    if (error) throw new Error(error.message)
  },
}
