import React, { useState, useEffect, useRef } from 'react'
import {
  Mic,
  Square,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Sparkles,
  RotateCcw,
  Clock,
} from 'lucide-react'
import {
  PTE_TASK_META,
  evaluatePteTask,
  countWords,
  countSentences,
} from '../scoring/pteScoringEngine'
import { evaluateWithGeminiRubric } from '../utils/geminiClient'
import {
  speakAustralianEnglish,
  stopSpeaking,
  createSpeechCaptureSession,
} from '../utils/aussieAudio'

export default function PteTaskRunner({
  item,
  itemAttempts = [],
  onCompleteAttempt,
  examMode = false,
  onNextExamItem,
}) {
  const meta = PTE_TASK_META[item.taskType] || PTE_TASK_META.RA
  const isSpeaking = meta.section === 'speaking'
  const isWriting = meta.section === 'writing'
  const hasAudioPrompt = Boolean(item.audioScript)

  const [transcript, setTranscript] = useState('')
  const [textAnswer, setTextAnswer] = useState('')
  const [blanksState, setBlanksState] = useState({})
  const [selectedOptions, setSelectedOptions] = useState([])
  const [selectedOption, setSelectedOption] = useState('')
  const [userOrder, setUserOrder] = useState([])
  const [selectedWordIndices, setSelectedWordIndices] = useState([])

  const [isRecording, setIsRecording] = useState(false)
  const [speechMetrics, setSpeechMetrics] = useState({
    durationSec: 0,
    pauseCount: 0,
    longPauseCount: 0,
    wordTimings: [],
  })
  const [micNotice, setMicNotice] = useState('')
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [isSynthesizingAudio, setIsSynthesizingAudio] = useState(false)
  const [showScriptHint, setShowScriptHint] = useState(false)
  const [timeLeft, setTimeLeft] = useState(meta.answerSec || 60)
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [evaluationResult, setEvaluationResult] = useState(null)

  const speechSessionRef = useRef(null)

  useEffect(() => {
    stopSpeaking()
    setTranscript('')
    setTextAnswer('')
    setBlanksState({})
    setSelectedOptions([])
    setSelectedOption('')
    setSelectedWordIndices([])
    setEvaluationResult(null)
    setMicNotice('')
    setIsRecording(false)
    setIsPlayingAudio(false)
    setIsSynthesizingAudio(false)
    setShowScriptHint(false)
    setSpeechMetrics({ durationSec: 0, pauseCount: 0, longPauseCount: 0, wordTimings: [] })
    setTimeLeft(meta.answerSec || 60)

    if (item.taskType === 'ROP' && Array.isArray(item.paragraphs)) {
      // Deterministically scramble paragraphs so initial order isn't already solved
      const ids = item.paragraphs.map(p => p.id)
      const scrambled = ids.length > 2 ? [ids[1], ids[3] || ids[0], ids[0], ids[2]].filter(Boolean) : [...ids].reverse()
      setUserOrder(scrambled)
    }
  }, [item.id, item.taskType, meta.answerSec, item.paragraphs])

  useEffect(() => {
    if (evaluationResult) return
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [item.id, evaluationResult])

  const handlePlayAudioPrompt = (rateOverride = null) => {
    const script = item.audioScript || item.promptText
    if (!script) return
    setIsPlayingAudio(true)
    speakAustralianEnglish(script, {
      rate: rateOverride,
      onLoading: loading => setIsSynthesizingAudio(loading),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    })
  }

  const handleStartRecording = () => {
    setMicNotice('')
    const session = createSpeechCaptureSession({
      onInterimTranscript: text => setTranscript(text),
      onFinalUpdate: data => {
        setTranscript(data.transcript)
        setSpeechMetrics({
          durationSec: data.durationSec,
          pauseCount: data.pauseCount,
          longPauseCount: data.longPauseCount,
          wordTimings: data.wordTimings || [],
        })
      },
      onError: msg => setMicNotice(msg),
    })
    speechSessionRef.current = session
    session.start()
    setIsRecording(true)
  }

  const handleStopRecording = () => {
    if (speechSessionRef.current) {
      const summary = speechSessionRef.current.stop()
      if (summary.transcript) setTranscript(summary.transcript)
      setSpeechMetrics({
        durationSec: summary.durationSec,
        pauseCount: summary.pauseCount,
        longPauseCount: summary.longPauseCount,
        wordTimings: summary.wordTimings || [],
      })
    }
    setIsRecording(false)
  }

  const toggleMultiOption = id => {
    setSelectedOptions(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const moveParagraph = (index, direction) => {
    const targetIdx = index + direction
    if (targetIdx < 0 || targetIdx >= userOrder.length) return
    const copy = [...userOrder]
    const temp = copy[index]
    copy[index] = copy[targetIdx]
    copy[targetIdx] = temp
    setUserOrder(copy)
  }

  const toggleHiwWord = idx => {
    setSelectedWordIndices(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    )
  }

  const buildUserResponsePayload = () => ({
    transcript,
    textAnswer,
    blanks: blanksState,
    selectedOptions,
    selectedOption,
    userOrder,
    selectedIndices: selectedWordIndices,
    durationSec: speechMetrics.durationSec || null,
    pauseCount: speechMetrics.pauseCount || 0,
    longPauseCount: speechMetrics.longPauseCount || 0,
    wordTimings: speechMetrics.wordTimings || [],
  })

  const handleSubmit = async () => {
    if (isRecording) handleStopRecording()
    stopSpeaking()
    setIsEvaluating(true)

    const userResponse = buildUserResponsePayload()
    let aiRubric = null
    const needsAiRubric = ['SWT', 'WE', 'SST', 'DI', 'RL', 'SGD', 'RTS'].includes(item.taskType)
    if (needsAiRubric && !examMode) {
      aiRubric = await evaluateWithGeminiRubric(item, userResponse)
    }

    const scored = evaluatePteTask(item, userResponse, aiRubric)
    setEvaluationResult(scored)
    setIsEvaluating(false)

    if (onCompleteAttempt) {
      onCompleteAttempt({
        itemId: item.id,
        taskType: item.taskType,
        section: meta.section,
        userResponse,
        scores: scored,
        communicativeContribution: scored.communicativeContribution,
        enablingContribution: scored.enablingContribution,
        feedback: { text: scored.feedback },
        durationSec: (meta.answerSec || 60) - timeLeft,
      })
    }

    if (examMode && onNextExamItem) {
      onNextExamItem(scored, userResponse)
    }
  }

  const renderPassageWithBlanks = () => {
    const text = item.promptText || ''
    const parts = text.split(/(\{\{b\d+\}\})/g)
    const blanksMap = {}
    ;(item.blanks || []).forEach(b => {
      blanksMap[b.id] = b
    })

    return (
      <div className="pte-passage-blanks">
        {parts.map((part, idx) => {
          const match = part.match(/^\{\{(b\d+)\}\}$/)
          if (!match) return <span key={idx}>{part}</span>
          const blankId = match[1]
          const blankDef = blanksMap[blankId] || { id: blankId, options: [] }

          if (item.taskType === 'RWFIB') {
            return (
              <select
                key={idx}
                aria-label={`Blank ${blankId}`}
                className="pte-blank-select"
                value={blanksState[blankId] || ''}
                onChange={e =>
                  setBlanksState(prev => ({ ...prev, [blankId]: e.target.value }))
                }
              >
                <option value="">-- select --</option>
                {(blankDef.options || []).map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )
          }

          if (item.taskType === 'RFIB') {
            return (
              <select
                key={idx}
                aria-label={`Blank ${blankId}`}
                className="pte-blank-select"
                value={blanksState[blankId] || ''}
                onChange={e =>
                  setBlanksState(prev => ({ ...prev, [blankId]: e.target.value }))
                }
              >
                <option value="">-- word bank --</option>
                {(item.wordBank || []).map(w => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            )
          }

          return (
            <input
              key={idx}
              type="text"
              aria-label={`Blank ${blankId}`}
              placeholder={`(${blankId})`}
              className="pte-blank-input"
              value={blanksState[blankId] || ''}
              onChange={e =>
                setBlanksState(prev => ({ ...prev, [blankId]: e.target.value }))
              }
            />
          )
        })}
      </div>
    )
  }

  const wordCount = countWords(textAnswer)
  const sentenceCount = countSentences(textAnswer)

  return (
    <div className="pte-task-runner-card">
      <div className="pte-task-header">
        <div>
          <div className="pte-badges-row">
            <span className={`pte-section-pill section-${meta.section}`}>
              {meta.section.toUpperCase()}
            </span>
            <span className="pte-code-pill">{meta.code}</span>
            <span className="pte-difficulty-pill">{item.difficulty || 'C1'}</span>
          </div>
          <h3 className="pte-task-title">{item.title}</h3>
          <p className="pte-task-desc">{meta.description}</p>
        </div>
        <div className="pte-timer-box">
          <Clock size={16} />
          <span>
            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Cross-Module Weighting Indicator */}
      <div className="pte-weights-strip">
        <span className="weights-label">Pearson Cross-Skill Scoring Impact:</span>
        {Object.entries(meta.weights).map(([skill, w]) => (
          <span key={skill} className="weight-chip">
            {skill.toUpperCase()} {Math.round(w * 100)}%
          </span>
        ))}
      </div>

      {/* Audio Prompt Player for Listening & Oral Tasks */}
      {hasAudioPrompt && (
        <div className="pte-audio-player-bar">
          <button
            type="button"
            className="btn-aussie-audio"
            onClick={() => handlePlayAudioPrompt(1.0)}
          >
            <Volume2 size={18} />
            <span>
              {isSynthesizingAudio
                ? 'Generating Natural AI Voice...'
                : isPlayingAudio
                ? 'Playing Natural Australian Voice...'
                : 'Play Natural AI Voice (1.0x)'}
            </span>
          </button>
          <button
            type="button"
            className="btn-secondary-small"
            onClick={() => handlePlayAudioPrompt(0.85)}
          >
            <Volume2 size={15} />
            <span>Play Slow & Clear (0.85x)</span>
          </button>
          {!examMode && (
            <button
              type="button"
              className="btn-secondary-small"
              onClick={() => setShowScriptHint(v => !v)}
            >
              <span>{showScriptHint ? 'Hide Audio Script' : 'Show Audio Script Hint'}</span>
            </button>
          )}
          <span className="audio-hint">
            Powered by Gemini Neural TTS (24kHz Natural Voice)
          </span>
          {showScriptHint && !examMode && (
            <div style={{ width: '100%', marginTop: '0.45rem', padding: '0.65rem 0.85rem', background: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E5E0', fontSize: '0.9rem' }}>
              <strong>Audio Transcript:</strong> {item.audioScript}
            </div>
          )}
        </div>
      )}

      {/* Describe Image SVG Chart Renderer */}
      {item.taskType === 'DI' && item.chartData && (
        <div className="pte-chart-box">
          <h4 className="chart-title">{item.chartData.title}</h4>
          <div className="chart-bars">
            {(item.chartData.series || []).map(row => (
              <div key={row.label} className="chart-bar-row">
                <span className="chart-bar-label">{row.label}</span>
                <div className="chart-bar-track">
                  <div
                    className="chart-bar-fill"
                    style={{
                      width: `${Math.min(100, (row.value / 150) * 100)}%`,
                      backgroundColor: row.color || '#10b981',
                    }}
                  />
                </div>
                <span className="chart-bar-val">
                  {row.value}
                  {item.chartData.unit || ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reading Passage or Prompt Text (when not hidden listening script) */}
      {item.promptText &&
        !['RWFIB', 'RFIB', 'LFIB'].includes(item.taskType) && (
          <div className="pte-prompt-box">
            <p>{item.promptText}</p>
          </div>
        )}

      {/* Fill in the Blanks (RWFIB, RFIB, LFIB) */}
      {['RWFIB', 'RFIB', 'LFIB'].includes(item.taskType) && (
        <div>
          {renderPassageWithBlanks()}
          {item.taskType === 'RFIB' && item.wordBank && (
            <div className="word-bank-box">
              <strong>Word Bank: </strong>
              {item.wordBank.map(w => (
                <span key={w} className="word-bank-chip">
                  {w}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Multiple Choice Multiple Answer (MCMA_R, MCMA_L) */}
      {['MCMA_R', 'MCMA_L'].includes(item.taskType) && (
        <div className="pte-options-list">
          {(item.options || []).map(opt => {
            const checked = selectedOptions.includes(opt.id)
            return (
              <label
                key={opt.id}
                className={`pte-option-card ${checked ? 'selected' : ''}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleMultiOption(opt.id)}
                />
                <span className="opt-id">{opt.id}.</span>
                <span>{opt.text}</span>
              </label>
            )
          })}
        </div>
      )}

      {/* Single Answer Multiple Choice (MCSA_R, MCSA_L, HCS, SMW) */}
      {['MCSA_R', 'MCSA_L', 'HCS', 'SMW'].includes(item.taskType) && (
        <div className="pte-options-list">
          {(item.options || []).map(opt => {
            const checked = selectedOption === opt.id
            return (
              <label
                key={opt.id}
                className={`pte-option-card ${checked ? 'selected' : ''}`}
              >
                <input
                  type="radio"
                  name={`single_${item.id}`}
                  checked={checked}
                  onChange={() => setSelectedOption(opt.id)}
                />
                <span className="opt-id">{opt.id}.</span>
                <span>{opt.text}</span>
              </label>
            )
          })}
        </div>
      )}

      {/* Re-order Paragraphs (ROP) */}
      {item.taskType === 'ROP' && (
        <div className="pte-rop-list">
          {userOrder.map((pid, idx) => {
            const para = (item.paragraphs || []).find(p => p.id === pid)
            if (!para) return null
            return (
              <div key={pid} className="pte-rop-item">
                <div className="rop-Order-badge">#{idx + 1}</div>
                <p className="rop-text">{para.text}</p>
                <div className="rop-controls">
                  <button
                    type="button"
                    aria-label={`Move paragraph ${idx + 1} up`}
                    disabled={idx === 0}
                    onClick={() => moveParagraph(idx, -1)}
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Move paragraph ${idx + 1} down`}
                    disabled={idx === userOrder.length - 1}
                    onClick={() => moveParagraph(idx, 1)}
                  >
                    <ArrowDown size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Highlight Incorrect Words (HIW) */}
      {item.taskType === 'HIW' && (
        <div className="pte-hiw-box">
          <p className="hiw-instructions">
            Click on the words that differ from what the speaker says (+1 correct hit, -1 false click):
          </p>
          <div className="hiw-words-wrap">
            {(item.displayWords || []).map((word, idx) => {
              const isSelected = selectedWordIndices.includes(idx)
              return (
                <button
                  key={idx}
                  type="button"
                  className={`hiw-word-token ${isSelected ? 'hiw-selected' : ''}`}
                  onClick={() => toggleHiwWord(idx)}
                >
                  {word}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Speaking Recorder & Live Transcript */}
      {isSpeaking && (
        <div className="pte-speaking-zone">
          <div className="speaking-controls-row">
            {!isRecording ? (
              <button
                type="button"
                className="btn-record-start"
                onClick={handleStartRecording}
              >
                <Mic size={18} />
                <span>Start Microphone Recording</span>
              </button>
            ) : (
              <button
                type="button"
                className="btn-record-stop"
                onClick={handleStopRecording}
              >
                <Square size={18} />
                <span>Stop Recording</span>
              </button>
            )}
            {(item.taskType === 'RA' || item.taskType === 'RS') && (
              <>
                <button
                  type="button"
                  className="btn-secondary-small"
                  onClick={() => {
                    const text = item.audioScript || item.promptText
                    setTranscript(text)
                    setSpeechMetrics({
                      durationSec: null,
                      pauseCount: 0,
                      longPauseCount: 0,
                      wordTimings: [],
                    })
                  }}
                >
                  Simulate Smooth Native Flow
                </button>
                <button
                  type="button"
                  className="btn-secondary-small"
                  onClick={() => {
                    const baseWords = String(item.audioScript || item.promptText)
                      .trim()
                      .split(/\s+/)
                    // Insert simulated extra pauses (double/quadruple spaces) at 2 places
                    const withPauses = baseWords
                      .map((w, idx) => (idx === 3 ? `    ${w}` : idx === 7 ? `  ${w}` : w))
                      .join(' ')
                    const simulatedTimings = baseWords.map((w, idx) => ({
                      word: w.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, ''),
                      pauseBeforeSec: idx === 3 ? 1.45 : idx === 7 ? 0.85 : 0.28,
                    }))
                    setTranscript(withPauses)
                    setSpeechMetrics({
                      durationSec: Number((baseWords.length * 0.42 + 2.3).toFixed(1)),
                      pauseCount: 2,
                      longPauseCount: 1,
                      wordTimings: simulatedTimings,
                    })
                  }}
                >
                  Simulate Response with Pauses
                </button>
              </>
            )}
          </div>
          {micNotice && <p className="mic-notice-text">{micNotice}</p>}
          <label className="transcript-label">
            Spoken Transcript (Speak via microphone, or type 2+ spaces / &ldquo;...&rdquo; between words to test pause detection):
          </label>
          <textarea
            rows={3}
            className="pte-textarea"
            placeholder="Speak into your microphone or type/paste your spoken response here..."
            value={transcript}
            onChange={e => setTranscript(e.target.value)}
          />
        </div>
      )}

      {/* Writing & Dictation Text Input (SWT, WE, SST, WFD) */}
      {(isWriting || ['SST', 'WFD'].includes(item.taskType)) && (
        <div className="pte-writing-zone">
          <textarea
            rows={item.taskType === 'WE' ? 9 : item.taskType === 'WFD' ? 2 : 5}
            className="pte-textarea"
            placeholder={
              item.taskType === 'SWT'
                ? 'Write a single-sentence summary between 5 and 75 words...'
                : item.taskType === 'WE'
                ? 'Write your 200–300 word academic essay here...'
                : item.taskType === 'SST'
                ? 'Write a 50–70 word summary of the lecture...'
                : 'Type the exact sentence you heard...'
            }
            value={textAnswer}
            onChange={e => setTextAnswer(e.target.value)}
          />
          <div className="writing-counter-bar">
            <span>
              Words: <strong>{wordCount}</strong>
              {item.taskType === 'SWT' && ' (Target: 5–75 words)'}
              {item.taskType === 'WE' && ' (Target: 200–300 words)'}
              {item.taskType === 'SST' && ' (Target: 50–70 words)'}
            </span>
            {item.taskType === 'SWT' && (
              <span className={sentenceCount > 1 ? 'counter-danger' : ''}>
                Sentences: <strong>{sentenceCount}</strong> (Must be 1 sentence)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Submit Action */}
      <div className="pte-submit-row">
        <button
          type="button"
          className="btn-primary-submit"
          disabled={isEvaluating}
          onClick={handleSubmit}
        >
          <Sparkles size={18} />
          <span>
            {isEvaluating
              ? 'Scoring with Pearson Algorithm + Gemini AI...'
              : examMode
              ? 'Save & Next Question'
              : 'Evaluate Response & Show Score Breakdown'}
          </span>
        </button>
      </div>

      {/* Detailed Reverse-Engineered Score Breakdown */}
      {evaluationResult && !examMode && (
        <div className="pte-score-report-panel">
          <div className="score-report-top">
            <div className="score-circle-badge">
              <span className="score-big">{evaluationResult.pteScaleEquivalent}</span>
              <span className="score-sub">/ 90 PTE Eq.</span>
            </div>
            <div className="score-summary-meta">
              <h4>
                Raw Task Score: {evaluationResult.rawPoints} / {evaluationResult.maxPoints} (
                {evaluationResult.percentage}%)
              </h4>
              <p className="score-feedback-text">{evaluationResult.feedback}</p>
            </div>
            <button
              type="button"
              className="btn-secondary-small"
              onClick={() => setEvaluationResult(null)}
            >
              <RotateCcw size={15} /> Retry
            </button>
          </div>

          {/* Subscore Trait Bars */}
          <div className="subscores-grid">
            {Object.entries(evaluationResult.subscores || {}).map(([trait, obj]) => (
              <div key={trait} className="subscore-card">
                <span className="subscore-name">{trait.toUpperCase()}</span>
                <strong className="subscore-val">
                  {obj.score} {obj.max > 0 ? `/ ${obj.max}` : ''}
                </strong>
              </div>
            ))}
            {typeof evaluationResult.wpm === 'number' && evaluationResult.wpm > 0 && (
              <div className="subscore-card">
                <span className="subscore-name">SPEECH PACE</span>
                <strong className="subscore-val">{evaluationResult.wpm} WPM</strong>
              </div>
            )}
            {Array.isArray(evaluationResult.pauseLocations) && isSpeaking && (
              <div className="subscore-card">
                <span className="subscore-name">EXTRA PAUSES</span>
                <strong className="subscore-val">
                  {evaluationResult.pauseLocations.length} detected
                </strong>
              </div>
            )}
          </div>

          {/* Word-Level Alignment Diff + Exact Pause Badges for RA, RS, WFD */}
          {Array.isArray(evaluationResult.diff) && evaluationResult.diff.length > 0 && (
            <div className="word-diff-container">
              <h5>
                Word-by-Word Alignment & Pause Map (Shows Exact Places Where You Paused):
              </h5>
              <div className="word-diff-tokens">
                {evaluationResult.diff.map((tok, i) => {
                  const pauseSec = tok.pauseBeforeSec || 0
                  const hasShortPause = pauseSec >= 0.6 && pauseSec < 1.2
                  const hasLongPause = pauseSec >= 1.2
                  return (
                    <React.Fragment key={i}>
                      {(hasShortPause || hasLongPause) && (
                        <span
                          className={`pause-gap-badge ${
                            hasLongPause ? 'pause-gap-long' : 'pause-gap-short'
                          }`}
                          title={`Unnatural pause of ${pauseSec}s before "${tok.word}"`}
                        >
                          {hasLongPause
                            ? `⚠️ +${pauseSec}s PAUSE`
                            : `⏸ +${pauseSec}s`}
                        </span>
                      )}
                      <span className={`diff-token diff-${tok.status}`}>
                        {tok.word}
                        {tok.status === 'replaced' && tok.spoken ? ` (${tok.spoken})` : ''}
                      </span>
                    </React.Fragment>
                  )
                })}
              </div>
              <div className="diff-legend">
                <span className="legend-item diff-correct">Matched</span>
                <span className="legend-item diff-missing">Omitted</span>
                <span className="legend-item diff-replaced">Substituted</span>
                <span className="legend-item diff-extra">Extra Word</span>
                <span className="legend-item pause-gap-short">⏸ Short Pause (0.6–1.1s)</span>
                <span className="legend-item pause-gap-long">⚠️ Long Pause (&ge;1.2s)</span>
              </div>
            </div>
          )}

          {/* Open-Ended Speaking Pause Map (for DI, RL, SGD, RTS where there is no fixed diff) */}
          {!evaluationResult.diff &&
            Array.isArray(evaluationResult.speechFlowTokens) &&
            evaluationResult.speechFlowTokens.length > 0 && (
              <div className="word-diff-container">
                <h5>Spoken Rhythm & Pause Map (Shows Where You Hesitated or Paused):</h5>
                <div className="word-diff-tokens">
                  {evaluationResult.speechFlowTokens.map((tok, i) => {
                    const pauseSec = tok.pauseBeforeSec || 0
                    const hasShortPause = pauseSec >= 0.6 && pauseSec < 1.2
                    const hasLongPause = pauseSec >= 1.2
                    return (
                      <React.Fragment key={i}>
                        {(hasShortPause || hasLongPause) && (
                          <span
                            className={`pause-gap-badge ${
                              hasLongPause ? 'pause-gap-long' : 'pause-gap-short'
                            }`}
                          >
                            {hasLongPause
                              ? `⚠️ +${pauseSec}s PAUSE`
                              : `⏸ +${pauseSec}s`}
                          </span>
                        )}
                        <span
                          className={`diff-token ${
                            tok.isFiller || tok.isRepeat ? 'diff-replaced' : 'diff-correct'
                          }`}
                        >
                          {tok.word}
                        </span>
                      </React.Fragment>
                    )
                  })}
                </div>
              </div>
            )}

          {/* Explicit Pause Locations Summary Box */}
          {isSpeaking && Array.isArray(evaluationResult.pauseLocations) && (
            <div className="fluency-pause-summary-box">
              {evaluationResult.pauseLocations.length === 0 ? (
                <span className="pause-summary-clean">
                  ✓ Zero unnatural pauses detected! Your words flowed smoothly without gaps.
                </span>
              ) : (
                <div>
                  <strong>
                    ⏸ Where You Made Extra Pauses ({evaluationResult.pauseLocations.length}):
                  </strong>
                  <div className="pause-locations-chips">
                    {evaluationResult.pauseLocations.map((p, idx) => (
                      <span
                        key={idx}
                        className={`pause-location-pill ${
                          p.severity === 'long' ? 'pause-gap-long' : 'pause-gap-short'
                        }`}
                      >
                        &ldquo;{p.afterWord}&rdquo; <strong>⏸ +{p.durationSec}s</strong> &ldquo;
                        {p.beforeWord}&rdquo;
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Per-Activity History of Past Responses & Scores */}
      {!examMode && (
        <div className="activity-history-section">
          <div className="activity-history-header">
            <h4>
              <Clock size={17} /> Activity History — Saved Responses & Scores ({itemAttempts.length})
            </h4>
            <span className="subtle-caption">
              Click any previous attempt to reload your response and inspect its full diagnostic breakdown
            </span>
          </div>

          {itemAttempts.length === 0 ? (
            <p className="subtle-caption">
              No attempts saved for this activity yet. Submit a response above to save your score and answer history.
            </p>
          ) : (
            <div className="activity-history-list">
              {itemAttempts.map((att, idx) => {
                const sc = att.scores || {}
                const resp = att.userResponse || {}
                const attemptNum = itemAttempts.length - idx
                const dateLabel = att.createdAt
                  ? new Date(att.createdAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Just now'

                let responseSummaryText = ''
                if (resp.transcript) {
                  responseSummaryText = resp.transcript
                } else if (resp.textAnswer) {
                  responseSummaryText = resp.textAnswer
                } else if (resp.blanks && Object.keys(resp.blanks).length > 0) {
                  responseSummaryText = Object.entries(resp.blanks)
                    .map(([k, v]) => `${k}: "${v}"`)
                    .join(' • ')
                } else if (Array.isArray(resp.selectedOptions) && resp.selectedOptions.length > 0) {
                  responseSummaryText = `Selected options: ${resp.selectedOptions.join(', ')}`
                } else if (resp.selectedOption) {
                  responseSummaryText = `Selected option: ${resp.selectedOption}`
                } else if (Array.isArray(resp.userOrder) && resp.userOrder.length > 0) {
                  responseSummaryText = `Paragraph order: ${resp.userOrder.join(' → ')}`
                } else if (Array.isArray(resp.selectedIndices) && resp.selectedIndices.length > 0) {
                  const wordsPicked = resp.selectedIndices
                    .map(i => (item.displayWords || [])[i])
                    .filter(Boolean)
                  responseSummaryText = `Highlighted words: ${wordsPicked.join(', ')}`
                }

                return (
                  <div key={att.id || idx} className="activity-history-card">
                    <div className="history-card-top">
                      <div className="history-meta-left">
                        <span className="history-attempt-badge">Attempt #{attemptNum}</span>
                        <span className="history-date-label">{dateLabel}</span>
                        <span className="history-raw-score">
                          Score: <strong>{sc.rawPoints ?? 0}/{sc.maxPoints ?? 10}</strong> ({sc.percentage ?? 0}%)
                        </span>
                        <span className="history-pte-eq">
                          {sc.pteScaleEquivalent ?? 65}/90 PTE Eq.
                        </span>
                      </div>

                      <button
                        type="button"
                        className="btn-secondary-small"
                        onClick={() => {
                          if (resp.transcript !== undefined) setTranscript(resp.transcript)
                          if (resp.textAnswer !== undefined) setTextAnswer(resp.textAnswer)
                          if (resp.blanks) setBlanksState(resp.blanks)
                          if (resp.selectedOptions) setSelectedOptions(resp.selectedOptions)
                          if (resp.selectedOption !== undefined) setSelectedOption(resp.selectedOption)
                          if (Array.isArray(resp.userOrder) && resp.userOrder.length > 0) {
                            setUserOrder(resp.userOrder)
                          }
                          if (resp.selectedIndices) setSelectedWordIndices(resp.selectedIndices)
                          setEvaluationResult(sc)
                        }}
                      >
                        <RotateCcw size={13} /> Inspect / Load Attempt
                      </button>
                    </div>

                    {/* Trait Subscores Row */}
                    {sc.subscores && Object.keys(sc.subscores).length > 0 && (
                      <div className="history-subscores-pills">
                        {Object.entries(sc.subscores).map(([trait, tObj]) => (
                          <span key={trait} className="history-trait-pill">
                            {trait.toUpperCase()}: <strong>{tObj.score}{tObj.max > 0 ? `/${tObj.max}` : ''}</strong>
                          </span>
                        ))}
                        {typeof sc.wpm === 'number' && sc.wpm > 0 && (
                          <span className="history-trait-pill">
                            PACE: <strong>{sc.wpm} WPM</strong>
                          </span>
                        )}
                        {Array.isArray(sc.pauseLocations) && sc.pauseLocations.length > 0 && (
                          <span className="history-trait-pill pause-gap-short">
                            ⏸ EXTRA PAUSES: <strong>{sc.pauseLocations.length}</strong>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Saved User Response Box */}
                    {responseSummaryText && (
                      <div className="history-response-box">
                        <strong>Saved Response:</strong> <span>{responseSummaryText}</span>
                      </div>
                    )}

                    {/* Feedback Note */}
                    {(sc.feedback || att.feedback?.text) && (
                      <p className="history-feedback-note">
                        {sc.feedback || att.feedback?.text}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
