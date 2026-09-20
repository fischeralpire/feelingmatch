// Frei angelegte, personenbezogene Emotionen ("Joker-Karte", siehe
// supabase/schema.sql `custom_emotions`) – bewusst ohne KI-Analyse: Name,
// Emoji und Ampel-Farbe wählt die Person selbst. Ergebnisse werden auf die
// gleiche Form wie Einträge aus data/emotions.js gemappt, damit sie überall
// (EmotionFace, EmotionPicker, Logging, Wochenchart) wie eine normale
// Emotion behandelt werden können.
import { supabase } from './supabaseClient'
import { AMPEL_LIGHT, AMPEL_MIDPOINT_VALENCE } from '../data/emotions'

function mapRow(row) {
  return {
    id: `custom:${row.id}`,
    name: row.name,
    emoji: row.emoji,
    color: AMPEL_LIGHT[row.ampel_color],
    family: 'eigene',
    valence: AMPEL_MIDPOINT_VALENCE[row.ampel_color],
    arousal: 3,
    ampelColor: row.ampel_color,
    custom: true,
  }
}

export const customEmotionsService = {
  async list(userId) {
    const { data, error } = await supabase
      .from('custom_emotions')
      .select('id, name, emoji, ampel_color')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (error) throw new Error(error.message)
    return data.map(mapRow)
  },

  async create(userId, { name, emoji, ampelColor }) {
    const { data, error } = await supabase
      .from('custom_emotions')
      .insert({ user_id: userId, name: name.trim(), emoji, ampel_color: ampelColor })
      .select('id, name, emoji, ampel_color')
      .single()
    if (error) throw new Error(error.message)
    return mapRow(data)
  },
}
