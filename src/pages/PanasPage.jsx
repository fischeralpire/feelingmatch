import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import EmotionFace from '../components/EmotionFace'
import { FEELING_CHECK_TREE, TYPICAL_STEPS, buildAnswerEntry, evaluateFeelingCheck, suggestEmotions } from '../data/panas'
import { useT } from '../i18n/useT'
import './QuestionFlow.css'

export default function PanasPage() {
  const navigate = useNavigate()
  const t = useT()
  const [nodeId, setNodeId] = useState(FEELING_CHECK_TREE.start)
  const [answers, setAnswers] = useState([])

  const node = FEELING_CHECK_TREE.nodes[nodeId]
  const nodeText = t('panas.nodes.' + nodeId)
  const step = answers.length
  const progress = Math.min(100, (step / TYPICAL_STEPS) * 100)

  const preview = useMemo(() => (step >= 3 ? evaluateFeelingCheck(answers) : null), [answers, step])
  const suggestions = useMemo(() => (step >= 3 ? suggestEmotions(answers, 3) : []), [answers, step])

  function answer(option) {
    const entry = buildAnswerEntry(node, option)
    const next = [...answers, entry]
    if (option.next) {
      setAnswers(next)
      setNodeId(option.next)
    } else {
      navigate('/panasresult', { state: { answers: next } })
    }
  }

  function pickSuggestion(emotion) {
    navigate('/panasresult', {
      state: { matched: emotion, valence: preview.valence, arousal: preview.arousal },
    })
  }

  return (
    <div className="fm-page">
      <TopBar back="/home" title={t('panas.title')} />
      <p className="fm-muted" style={{ marginBottom: 14 }}>
        {t('panas.intro')}
      </p>
      <div className="fm-question-card">
        <div>
          <div className="fm-progress-track">
            <div className="fm-progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <p className="fm-question-step">{t('panas.questionLabel', { n: step + 1 })}</p>
          <h1 className="fm-panas-word" style={{ fontSize: 24 }}>
            {nodeText.q}
          </h1>
          <div className="fm-answer-list">
            {node.options.map((o, i) => (
              <button key={o.label} type="button" className="fm-answer" onClick={() => answer(o)}>
                {nodeText.o[i]}
              </button>
            ))}
          </div>

          {suggestions.length > 0 && (
            <div className="fm-quickmatch">
              <p className="fm-quickmatch__label">{t('panas.fitAlready')}</p>
              <div className="fm-quickmatch__list">
                {suggestions.map((emotion) => (
                  <button
                    key={emotion.name}
                    type="button"
                    className="fm-quickmatch__chip"
                    onClick={() => pickSuggestion(emotion)}
                  >
                    <EmotionFace emoji={emotion.emoji} background={emotion.color} size={28} fontSize={14} />
                    {t(`emotions.${emotion.name}`)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
