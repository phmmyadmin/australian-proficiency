import React, { useState, useRef, useEffect } from 'react'
import {
  X,
  Volume2,
  Mic,
  Square,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react'
import {
  generateApproximateIPA,
  scoreSingleWordPronunciation,
} from '../utils/phonetics'
import {
  speakAustralianEnglish,
  stopSpeaking,
  createSpeechCaptureSession,
} from '../utils/aussieAudio'

export default function WordPronunciationModal({
  token,
  onClose,
}) {
  const word = token?.word || ''
  const spokenOriginal = token?.spoken || ''
  const status = token?.status || 'correct'
  const ipa = generateApproximateIPA(word)

  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordedWord, setRecordedWord] = useState('')
  const [result, setResult] = useState(null)
  const [micNotice, setMicNotice] = useState('')

  const sessionRef = useRef(null)

  useEffect(() => {
    stopSpeaking()
    setResult(null)
    setRecordedWord('')
    setIsRecording(false)
    setMicNotice('')
  }, [word])

  if (!word) return null

  const handlePlayAudio = (rate = 1.0) => {
    setIsPlayingAudio(true)
    speakAustralianEnglish(word, {
      rate,
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    })
  }

  const handleStartRecording = () => {
    setMicNotice('')
    setResult(null)
    setRecordedWord('')

    const session = createSpeechCaptureSession({
      onInterimTranscript: text => {
        setRecordedWord(text.trim())
      },
      onFinalUpdate: data => {
        const text = data.transcript.trim()
        setRecordedWord(text)
        evaluateSpokenWord(text)
      },
      onError: msg => setMicNotice(msg),
    })

    sessionRef.current = session
    session.start()
    setIsRecording(true)
  }

  const handleStopRecording = () => {
    if (sessionRef.current) {
      const summary = sessionRef.current.stop()
      const text = (summary.transcript || recordedWord).trim()
      setRecordedWord(text)
      evaluateSpokenWord(text)
    }
    setIsRecording(false)
  }

  const evaluateSpokenWord = spokenText => {
    const scored = scoreSingleWordPronunciation(word, spokenText)
    setResult(scored)
  }

  const getStatusBadge = () => {
    if (status === 'correct') {
      return (
        <span className="pte-code-pill" style={{ background: '#DCFCE7', color: '#15803D' }}>
          <CheckCircle2 size={13} style={{ marginRight: '4px' }} /> Matched in Exam
        </span>
      )
    }
    if (status === 'replaced') {
      return (
        <span className="pte-code-pill" style={{ background: '#FEF3C7', color: '#B45309' }}>
          <AlertCircle size={13} style={{ marginRight: '4px' }} /> Mispronounced / Substituted
        </span>
      )
    }
    if (status === 'missing') {
      return (
        <span className="pte-code-pill" style={{ background: '#FEE2E2', color: '#B91C1C' }}>
          <AlertCircle size={13} style={{ marginRight: '4px' }} /> Omitted / Skipped
        </span>
      )
    }
    return (
      <span className="pte-code-pill" style={{ background: '#E0E7FF', color: '#3730A3' }}>
        Extra Word
      </span>
    )
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="settings-modal-card"
        style={{ maxWidth: '540px' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={20} color="#0F766E" />
            <h3 style={{ margin: 0 }}>Word Pronunciation & Phonetics</h3>
          </div>
          <button
            type="button"
            className="icon-btn"
            aria-label="Close word drill"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '1.25rem 0' }}>
          {/* Top Word Display */}
          <div
            style={{
              textAlign: 'center',
              padding: '1.2rem',
              background: '#F8FAF9',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
            }}
          >
            <div style={{ marginBottom: '0.5rem' }}>{getStatusBadge()}</div>
            <h2
              style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: '#111827',
                margin: '0.25rem 0',
                letterSpacing: '-0.02em',
              }}
            >
              {word}
            </h2>
            <div
              style={{
                fontSize: '1.25rem',
                fontFamily: 'monospace',
                color: '#0F766E',
                fontWeight: 600,
              }}
            >
              {ipa}
            </div>

            {spokenOriginal && status === 'replaced' && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.88rem', color: '#6B7280' }}>
                You originally said:{' '}
                <strong style={{ color: '#DC2626' }}>&ldquo;{spokenOriginal}&rdquo;</strong>
              </p>
            )}

            {/* Audio Pronunciation Buttons */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '0.6rem',
                marginTop: '1rem',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                className="btn-aussie-audio"
                onClick={() => handlePlayAudio(1.0)}
              >
                <Volume2 size={16} />
                <span>{isPlayingAudio ? 'Playing Audio...' : 'Listen Native (1.0x)'}</span>
              </button>
              <button
                type="button"
                className="btn-secondary-small"
                onClick={() => handlePlayAudio(0.75)}
              >
                <Volume2 size={14} />
                <span>Slow & Clear (0.75x)</span>
              </button>
            </div>
          </div>

          {/* Practice Recording Section */}
          <div
            style={{
              marginTop: '1.25rem',
              padding: '1.1rem',
              background: '#FFFFFF',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#111827' }}>
                Re-attempt Word & Get Instant Score:
              </span>
              <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                PTE Pronunciation Calibration
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
              {!isRecording ? (
                <button
                  type="button"
                  className="btn-record-start"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={handleStartRecording}
                >
                  <Mic size={18} />
                  <span>Record & Pronounce &ldquo;{word}&rdquo;</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-record-stop"
                  style={{ flex: 1, justifyContent: 'center' }}
                  onClick={handleStopRecording}
                >
                  <Square size={18} />
                  <span>Stop Recording</span>
                </button>
              )}
            </div>

            {micNotice && (
              <p className="mic-notice-text" style={{ marginTop: '0.5rem' }}>
                {micNotice}
              </p>
            )}

            {recordedWord && (
              <div
                style={{
                  marginTop: '0.75rem',
                  padding: '0.6rem 0.8rem',
                  background: '#F3F4F6',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                }}
              >
                <strong>We heard:</strong> &ldquo;{recordedWord}&rdquo;
              </div>
            )}

            {/* Pronunciation Feedback & Score Result */}
            {result && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  background: result.isMatch ? '#F0FDF4' : '#FEF3C7',
                  borderRadius: '10px',
                  border: `1px solid ${result.isMatch ? '#86EFAC' : '#FCD34D'}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.4rem',
                  }}
                >
                  <span
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 700,
                      color: result.isMatch ? '#15803D' : '#B45309',
                    }}
                  >
                    Score: {result.score}%
                  </span>
                  <span style={{ fontSize: '1rem', color: '#EAB308' }}>
                    {'★'.repeat(result.pteStarRating)}
                    {'☆'.repeat(5 - result.pteStarRating)}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.88rem', color: '#1F2937' }}>
                  {result.feedback}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>
            Click outside or press Esc to return
          </span>
          <button
            type="button"
            className="btn-secondary-small"
            onClick={onClose}
          >
            Close Drill
          </button>
        </div>
      </div>
    </div>
  )
}
