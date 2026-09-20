import { useState } from 'react'
import { Check } from 'lucide-react'
import AmpelCircles from './AmpelCircles'
import Button from './Button'

const EMOJI_CHOICES = [
  '😀', '🙂', '😌', '🥰', '🤩', '😐', '😕', '😢', '😭', '😠',
  '😨', '😳', '😴', '🥱', '🤗', '🥲', '😤', '🫠',
]

const AMPEL_OPTIONS = [
  { id: 'green', label: 'Fühlt sich gut an' },
  { id: 'yellow', label: 'Geht so' },
  { id: 'red', label: 'Fühlt sich schwer an' },
]

// Inline-Formular für eine frei angelegte, eigene Emotion ("Joker-Karte") –
// bewusst nur Name + Emoji + Ampel-Farbe, keine KI-Analyse. Wird innerhalb
// von EmotionPicker eingeblendet.
export default function CustomEmotionForm({ onCancel, onCreate, saving }) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(EMOJI_CHOICES[0])
  const [ampelColor, setAmpelColor] = useState('yellow')

  const canSubmit = name.trim().length > 0 && !saving

  return (
    <div className="fm-custom-emotion">
      <input
        className="fm-input"
        placeholder="Wie nennst du dieses Gefühl?"
        maxLength={30}
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />

      <div className="fm-custom-emotion__emojis">
        {EMOJI_CHOICES.map((e) => (
          <button
            key={e}
            type="button"
            className={`fm-custom-emotion__emoji ${emoji === e ? 'is-selected' : ''}`}
            onClick={() => setEmoji(e)}
          >
            {e}
          </button>
        ))}
      </div>

      <div className="fm-field__label" style={{ marginTop: 12 }}>
        Wie fühlt sich das eher an?
      </div>
      <AmpelCircles options={AMPEL_OPTIONS} selected={ampelColor} onSelect={setAmpelColor} size={26} />

      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <Button variant="ghost" onClick={onCancel} style={{ flex: 1, justifyContent: 'center' }}>
          Abbrechen
        </Button>
        <Button
          variant="dark"
          disabled={!canSubmit}
          onClick={() => onCreate({ name, emoji, ampelColor })}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <Check size={16} /> {saving ? 'Speichert…' : 'Hinzufügen'}
        </Button>
      </div>
    </div>
  )
}
