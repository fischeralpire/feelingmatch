// Freundschaften: suchen, anfragen, annehmen. Arbeitet direkt gegen die
// `friendships`/`profiles`-Tabellen in Supabase (siehe supabase/schema.sql),
// abgesichert durch Row-Level-Security – jede Nutzerin sieht nur eigene Zeilen.
import { supabase } from './supabaseClient'

function mapProfile(row) {
  return {
    id: row.id,
    displayName: row.display_name,
    statusText: row.status_text ?? '',
    statusColor: row.status_color ?? null,
    painLevel: row.pain_level ?? null,
    avatarUrl: row.avatar_url ?? null,
  }
}

const PROFILE_COLUMNS = 'id,display_name,status_text,status_color,pain_level,avatar_url'

export const friendsService = {
  async getProfile(profileId) {
    const { data, error } = await supabase.from('profiles').select(PROFILE_COLUMNS).eq('id', profileId).single()
    if (error) throw new Error(error.message)
    return mapProfile(data)
  },

  async searchProfiles(query, excludeUserId) {
    const trimmed = query.trim()
    if (!trimmed) return []
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name')
      .ilike('display_name', `%${trimmed}%`)
      .neq('id', excludeUserId)
      .limit(10)
    if (error) throw new Error(error.message)
    return data.map(mapProfile)
  },

  async listFriends(userId) {
    const { data, error } = await supabase
      .from('friendships')
      .select(
        'id, requester_id, addressee_id,' +
          `requester:profiles!friendships_requester_id_fkey(${PROFILE_COLUMNS}),` +
          `addressee:profiles!friendships_addressee_id_fkey(${PROFILE_COLUMNS})`,
      )
      .eq('status', 'accepted')
      .or(`requester_id.eq.${userId},addressee_id.eq.${userId}`)
    if (error) throw new Error(error.message)
    return data.map((row) => {
      const other = row.requester_id === userId ? row.addressee : row.requester
      return { friendshipId: row.id, ...mapProfile(other) }
    })
  },

  async listIncomingRequests(userId) {
    const { data, error } = await supabase
      .from('friendships')
      .select('id, requester:profiles!friendships_requester_id_fkey(id,display_name)')
      .eq('status', 'pending')
      .eq('addressee_id', userId)
    if (error) throw new Error(error.message)
    return data.map((row) => ({ friendshipId: row.id, ...mapProfile(row.requester) }))
  },

  async sendFriendRequest(requesterId, addresseeId) {
    const { error } = await supabase
      .from('friendships')
      .insert({ requester_id: requesterId, addressee_id: addresseeId })
    if (error) {
      if (error.code === '23505') throw new Error('Ihr seid schon verbunden oder die Anfrage existiert bereits.')
      throw new Error(error.message)
    }
  },

  async acceptFriendRequest(friendshipId) {
    const { error } = await supabase.from('friendships').update({ status: 'accepted' }).eq('id', friendshipId)
    if (error) throw new Error(error.message)
  },

  // Für abgelehnte Anfragen und beendete Freundschaften gleichermaßen: die
  // Zeile wird entfernt, beide Seiten dürfen das (siehe RLS-Policy).
  async removeFriendship(friendshipId) {
    const { error } = await supabase.from('friendships').delete().eq('id', friendshipId)
    if (error) throw new Error(error.message)
  },
}
