import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, ShieldAlert, X } from 'lucide-react'
import { useT } from '../i18n/useT'
import './ChatPage.css'

const CONTACT_PATTERN = /(@|https?:\/\/|www\.|\+?\d[\d\s-]{6,})/i

const EXTEND_OPTIONS = [
  { seconds: 3600, key: 'extend1h' },
  { seconds: 7200, key: 'extend2h' },
  { seconds: 18000, key: 'extend5h' },
  { seconds: 86400, key: 'extend1d' },
  { seconds: 604800, key: 'extend1w' },
]

// Für die üblichen <1h zeigt der Timer m:ss (wie bisher); sobald jemand über
// den Extend-Dialog Stunden/Tage/eine Woche draufpackt, würde m:ss auf
// absurd große Zahlen laufen – ab da auf h/d-Kurzform umschalten.
function formatTime(totalSeconds) {
  if (totalSeconds >= 86400) {
    const d = Math.floor(totalSeconds / 86400)
    const h = Math.floor((totalSeconds % 86400) / 3600)
    return `${d}d ${h}h`
  }
  if (totalSeconds >= 3600) {
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    return `${h}h ${String(m).padStart(2, '0')}m`
  }
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export default function ChatPage() {
  const navigate = useNavigate()
  const t = useT()
  const [messages, setMessages] = useState(() => [
    { fromMe: false, text: t('chat.intro1') },
    { fromMe: true, text: t('chat.intro2') },
    { fromMe: false, text: t('chat.intro3') },
  ])
  const [draft, setDraft] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(59 * 60 + 42)
  const [extendOpen, setExtendOpen] = useState(false)
  const listRef = useRef(null)

  useEffect(() => {
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages])

  function send() {
    const text = draft.trim()
    if (!text) return
    const blocked = CONTACT_PATTERN.test(text)
    setMessages((prev) => [
      ...prev,
      { fromMe: true, text: blocked ? t('chat.blockedMessage') : text, blocked },
    ])
    setDraft('')
  }

  return (
    <div className="fm-chat">
      <header className="fm-chat__header">
        <div className="fm-chat__person">
          <button type="button" className="fm-btn fm-btn--icon" onClick={() => navigate('/found')} aria-label={t('common.back')}>
            <ArrowLeft size={16} />
          </button>
          <div className="fm-chat__avatar">{t('chat.partnerInitials')}</div>
          <div>
            <strong>{t('chat.partnerName')}</strong>
            <br />
            <small>
              <span className="fm-chat__dot" />
              {t('chat.similarEmotion')}
            </small>
          </div>
        </div>
        <button
          type="button"
          className="fm-chat__timer"
          onClick={() => setExtendOpen(true)}
          aria-label={t('chat.extendTitle')}
        >
          {formatTime(secondsLeft)}
        </button>
      </header>

      <div className="fm-chat__messages" ref={listRef}>
        <div className="fm-chat__system">{t('chat.systemNote')}</div>
        {messages.map((m, i) => (
          <div key={i} className={`fm-chat__bubble ${m.fromMe ? 'is-me' : 'is-other'} ${m.blocked ? 'is-blocked' : ''}`}>
            {m.blocked && <ShieldAlert size={14} style={{ marginRight: 6, verticalAlign: '-2px' }} />}
            {m.text}
          </div>
        ))}
      </div>

      <div className="fm-chat__footer">
        <button type="button" className="fm-btn fm-btn--outline" onClick={() => navigate('/home')}>
          {t('chat.end')}
        </button>
        <div className="fm-chat__input-row">
          <input
            className="fm-input"
            placeholder={t('chat.placeholder')}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
          />
          <button type="button" className="fm-chat__send" onClick={send} aria-label={t('chat.send')}>
            <Send size={18} />
          </button>
        </div>
      </div>

      {extendOpen && (
        <div className="fm-modal-backdrop" onClick={() => setExtendOpen(false)}>
          <div className="fm-modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="fm-modal-sheet__handle" />
            <div className="fm-modal-sheet__header">
              <span className="fm-modal-sheet__title">{t('chat.extendTitle')}</span>
              <button
                type="button"
                className="fm-btn fm-btn--icon"
                onClick={() => setExtendOpen(false)}
                aria-label={t('modal.close')}
              >
                <X size={16} />
              </button>
            </div>
            <div className="fm-chat__extend-options">
              {EXTEND_OPTIONS.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  className="fm-btn fm-btn--outline"
                  onClick={() => {
                    setSecondsLeft((s) => s + o.seconds)
                    setExtendOpen(false)
                  }}
                >
                  {t(`chat.${o.key}`)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
