import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Check, X, UserMinus } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { friendsService } from '../services/friendsService'
import { AMPEL_COLORS } from '../data/emotions'
import AvatarCircle from '../components/AvatarCircle'
import FriendProfilePreview from '../components/FriendProfilePreview'
import TrafficLight from '../components/TrafficLight'
import { useT } from '../i18n/useT'
import './FriendsPage.css'

export default function FriendsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const t = useT()
  const [friends, setFriends] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [previewFriend, setPreviewFriend] = useState(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError('')
    try {
      const [friendList, requestList] = await Promise.all([
        friendsService.listFriends(user.id),
        friendsService.listIncomingRequests(user.id),
      ])
      setFriends(friendList)
      setRequests(requestList)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  async function accept(friendshipId) {
    setBusyId(friendshipId)
    try {
      await friendsService.acceptFriendRequest(friendshipId)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function decline(friendshipId) {
    setBusyId(friendshipId)
    try {
      await friendsService.removeFriendship(friendshipId)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  async function removeFriend(friendshipId, displayName) {
    if (!window.confirm(t('friends.removeConfirm', { name: displayName }))) return
    setBusyId(friendshipId)
    try {
      await friendsService.removeFriendship(friendshipId)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="fm-page">
      <div className="fm-topbar">
        <h1 className="fm-serif-title" style={{ fontSize: 30 }}>
          {t('friends.title')}
        </h1>
        <button
          type="button"
          className="fm-btn fm-btn--icon"
          aria-label={t('friends.addAria')}
          onClick={() => navigate('/friends/add')}
        >
          <Plus size={18} />
        </button>
      </div>

      {error && <p className="fm-auth__error">{error}</p>}
      {loading && <p className="fm-muted">{t('common.loading')}</p>}

      {!loading && requests.length > 0 && (
        <>
          <h2 className="fm-section-title" style={{ margin: '6px 0 8px' }}>
            {t('friends.requests')}
          </h2>
          <div className="fm-friend-list" style={{ marginBottom: 20 }}>
            {requests.map((r) => (
              <div key={r.friendshipId} className="fm-friend-row" style={{ cursor: 'default' }}>
                <AvatarCircle avatarUrl={r.avatarUrl} name={r.displayName} size={52} className="fm-friend-row__avatar" />
                <div className="fm-friend-row__body">
                  <div className="fm-friend-row__name">
                    <span>{r.displayName}</span>
                  </div>
                  <div className="fm-friend-row__preview">{t('friends.wantsConnect')}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    type="button"
                    className="fm-btn fm-btn--icon"
                    aria-label={t('friends.decline')}
                    disabled={busyId === r.friendshipId}
                    onClick={() => decline(r.friendshipId)}
                  >
                    <X size={16} color="var(--red)" />
                  </button>
                  <button
                    type="button"
                    className="fm-btn fm-btn--dark"
                    style={{ padding: '8px 14px', fontSize: 13 }}
                    disabled={busyId === r.friendshipId}
                    onClick={() => accept(r.friendshipId)}
                  >
                    <Check size={14} /> {t('friends.accept')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!loading && friends.some((f) => f.statusText) && (
        <div className="fm-stories">
          {friends
            .filter((f) => f.statusText)
            .map((f) => (
              <button key={f.friendshipId} type="button" className="fm-story" onClick={() => setPreviewFriend(f)}>
                <div className="fm-story__bubble">{f.statusText}</div>
                <div className="fm-story__ring" style={{ background: AMPEL_COLORS[f.statusColor] ?? 'var(--border)' }}>
                  <AvatarCircle avatarUrl={f.avatarUrl} name={f.displayName} size={55} className="fm-story__avatar" />
                </div>
                <span className="fm-story__name">{f.displayName}</span>
              </button>
            ))}
        </div>
      )}

      <h2 className="fm-section-title" style={{ margin: '6px 0 8px' }}>
        {t('friends.myFriends')}
      </h2>
      {!loading && friends.length === 0 && (
        <p className="fm-muted">{t('friends.noFriends')}</p>
      )}
      <div className="fm-friend-list">
        {friends.map((f) => (
          <div key={f.friendshipId} className="fm-friend-row" style={{ cursor: 'default' }}>
            <button type="button" onClick={() => setPreviewFriend(f)} aria-label={`${f.displayName}s Profil ansehen`} style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}>
              <AvatarCircle avatarUrl={f.avatarUrl} name={f.displayName} size={52} background="var(--yellow)" className="fm-friend-row__avatar">
                {f.statusColor && <TrafficLight active={f.statusColor} size={5} className="fm-friend-row__ampel" />}
              </AvatarCircle>
            </button>
            <button
              type="button"
              onClick={() => navigate(`/friends/${f.id}`)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minWidth: 0,
                background: 'none',
                border: 0,
                padding: 0,
                textAlign: 'left',
                cursor: 'pointer',
                font: 'inherit',
                color: 'inherit',
              }}
            >
              <div className="fm-friend-row__name">
                <span>{f.displayName}</span>
              </div>
              <div className="fm-friend-row__preview">{f.statusText || t('friends.tapToChat')}</div>
            </button>
            <button
              type="button"
              className="fm-btn fm-btn--icon"
              aria-label={t('friends.removeAria')}
              disabled={busyId === f.friendshipId}
              onClick={() => removeFriend(f.friendshipId, f.displayName)}
            >
              <UserMinus size={16} color="var(--text-faint)" />
            </button>
          </div>
        ))}
      </div>

      <FriendProfilePreview
        friend={previewFriend}
        onClose={() => setPreviewFriend(null)}
        onOpenChat={() => {
          if (previewFriend) navigate(`/friends/${previewFriend.id}`)
          setPreviewFriend(null)
        }}
      />
    </div>
  )
}
