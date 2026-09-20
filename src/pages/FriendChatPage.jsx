import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { friendsService } from '../services/friendsService'
import { chatService } from '../services/chatService'
import AvatarCircle from '../components/AvatarCircle'
import FriendProfilePreview from '../components/FriendProfilePreview'
import './ChatPage.css'

export default function FriendChatPage() {
  const navigate = useNavigate()
  const { friendId } = useParams()
  const { user } = useAuth()
  const [friend, setFriend] = useState(null)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [previewOpen, setPreviewOpen] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    Promise.all([friendsService.getProfile(friendId), chatService.fetchMessages(user.id, friendId)])
      .then(([profile, msgs]) => {
        if (!active) return
        setFriend(profile)
        setMessages(msgs)
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false))

    const unsubscribe = chatService.subscribeToMessages(user.id, friendId, (message) => {
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]))
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [user.id, friendId])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages])

  async function send() {
    const text = draft.trim()
    if (!text) return
    setDraft('')
    try {
      await chatService.sendMessage(user.id, friendId, text)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="fm-chat">
      <header className="fm-chat__header">
        <div className="fm-chat__person">
          <button type="button" className="fm-btn fm-btn--icon" onClick={() => navigate('/friends')} aria-label="Zurück">
            <ArrowLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            aria-label="Profilbild vergrößern"
            style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
          >
            <AvatarCircle
              avatarUrl={friend?.avatarUrl}
              name={friend?.displayName ?? '?'}
              size={42}
              background="var(--yellow)"
              className="fm-chat__avatar"
              style={{ color: '#15171c', fontSize: 16 }}
            />
          </button>
          <div>
            <strong>{loading ? 'Lädt…' : (friend?.displayName ?? 'Unbekannt')}</strong>
          </div>
        </div>
      </header>

      {error && <p className="fm-auth__error" style={{ margin: '10px 14px 0' }}>{error}</p>}

      <div className="fm-chat__messages" ref={listRef}>
        {messages.map((m) => (
          <div key={m.id} className={`fm-chat__bubble ${m.senderId === user.id ? 'is-me' : 'is-other'}`}>
            {m.text}
          </div>
        ))}
      </div>

      <div className="fm-chat__footer">
        <div className="fm-chat__input-row">
          <input
            className="fm-input"
            placeholder="Nachricht schreiben..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button type="button" className="fm-chat__send" onClick={send} aria-label="Senden">
            <Send size={18} />
          </button>
        </div>
      </div>

      {previewOpen && <FriendProfilePreview friend={friend} onClose={() => setPreviewOpen(false)} />}
    </div>
  )
}
