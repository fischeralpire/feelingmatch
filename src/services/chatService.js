// 1:1-Nachrichten zwischen zwei Profilen, inkl. Realtime-Abo (siehe
// supabase/schema.sql, Tabelle `messages` ist zur supabase_realtime
// Publication hinzugefügt).
import { supabase } from './supabaseClient'

function mapMessage(row) {
  return {
    id: row.id,
    senderId: row.sender_id,
    recipientId: row.recipient_id,
    text: row.content,
    createdAt: row.created_at,
  }
}

export const chatService = {
  async fetchMessages(userId, friendId) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(
        `and(sender_id.eq.${userId},recipient_id.eq.${friendId}),` +
          `and(sender_id.eq.${friendId},recipient_id.eq.${userId})`,
      )
      .order('created_at', { ascending: true })
    if (error) throw new Error(error.message)
    return data.map(mapMessage)
  },

  async sendMessage(userId, friendId, text) {
    const { data, error } = await supabase
      .from('messages')
      .insert({ sender_id: userId, recipient_id: friendId, content: text })
      .select()
      .single()
    if (error) throw new Error(error.message)
    return mapMessage(data)
  },

  // Ruft onInsert für jede neue Nachricht zwischen userId <-> friendId auf.
  // Gibt eine Unsubscribe-Funktion zurück.
  subscribeToMessages(userId, friendId, onInsert) {
    const channel = supabase
      .channel(`messages-${[userId, friendId].sort().join('-')}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const row = payload.new
          const isThisConversation =
            (row.sender_id === userId && row.recipient_id === friendId) ||
            (row.sender_id === friendId && row.recipient_id === userId)
          if (isThisConversation) onInsert(mapMessage(row))
        },
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  },
}
