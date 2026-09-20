import { useState } from 'react'
import { Search, UserPlus } from 'lucide-react'
import TopBar from '../components/TopBar'
import { useAuth } from '../context/AuthContext'
import { friendsService } from '../services/friendsService'

export default function AddFriendPage() {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [sentIds, setSentIds] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function handleSearch(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    setSearching(true)
    try {
      const matches = await friendsService.searchProfiles(query, user.id)
      setResults(matches)
      if (matches.length === 0) setNotice('Niemanden mit diesem Anzeigenamen gefunden.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSearching(false)
    }
  }

  async function sendRequest(profile) {
    setError('')
    try {
      await friendsService.sendFriendRequest(user.id, profile.id)
      setSentIds((prev) => [...prev, profile.id])
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="fm-page fm-page--tight">
      <TopBar back="/friends" title="Freund hinzufügen" />
      <p className="fm-muted" style={{ marginBottom: 18 }}>
        Suche nach dem Anzeigenamen der Person, die du hinzufügen möchtest.
      </p>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input
          className="fm-input"
          placeholder="Anzeigename"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <button type="submit" className="fm-btn fm-btn--icon" aria-label="Suchen" disabled={searching}>
          <Search size={18} />
        </button>
      </form>

      {error && <p className="fm-auth__error">{error}</p>}
      {notice && <p className="fm-muted">{notice}</p>}

      <div className="fm-friend-list">
        {results.map((profile) => {
          const sent = sentIds.includes(profile.id)
          return (
            <div key={profile.id} className="fm-friend-row" style={{ cursor: 'default' }}>
              <div className="fm-friend-row__avatar" style={{ background: 'var(--surface-muted)' }}>
                {profile.displayName.slice(0, 1).toUpperCase()}
              </div>
              <div className="fm-friend-row__body">
                <div className="fm-friend-row__name">
                  <span>{profile.displayName}</span>
                </div>
              </div>
              <button
                type="button"
                className="fm-btn fm-btn--dark"
                style={{ padding: '8px 14px', fontSize: 13 }}
                disabled={sent}
                onClick={() => sendRequest(profile)}
              >
                <UserPlus size={14} /> {sent ? 'Gesendet' : 'Anfrage senden'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
