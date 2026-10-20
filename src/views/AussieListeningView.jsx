import React, { useState } from 'react'
import {
  Video,
  Volume2,
  Mic,
  Square,
  CheckCircle2,
  BookmarkPlus,
  PlusCircle,
  Sparkles,
  Headphones,
} from 'lucide-react'
import { alignWordSequences, evaluateFluencyAndPronunciation } from '../scoring/pteScoringEngine'
import {
  speakAustralianEnglish,
  createSpeechCaptureSession,
} from '../utils/aussieAudio'
import { generateYoutubeListeningPack } from '../utils/geminiClient'
import { initCard } from '../utils/fsrsEngine'

function extractYoutubeId(input = '') {
  const trimmed = input.trim()
  const reg = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  const match = trimmed.match(reg)
  if (match) return match[1]
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed
  return 'Znio724234Q'
}

export default function AussieListeningView({
  videos = [],
  onAddCustomVideo,
  onSaveVocabCard,
}) {
  const [selectedVideoId, setSelectedVideoId] = useState(videos[0]?.id || 'yt_aus_accent_01')
  const [activeSegmentIdx, setActiveSegmentIdx] = useState(0)
  const [dictationInput, setDictationInput] = useState('')
  const [dictationResult, setDictationResult] = useState(null)

  const [shadowTranscript, setShadowTranscript] = useState('')
  const [isRecordingShadow, setIsRecordingShadow] = useState(false)
  const [shadowResult, setShadowResult] = useState(null)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [addedWordsMap, setAddedWordsMap] = useState({})

  const [showAddModal, setShowAddModal] = useState(false)
  const [newYtUrl, setNewYtUrl] = useState('')
  const [newYtTitle, setNewYtTitle] = useState('')
  const [newYtTopic, setNewYtTopic] = useState('Australian Culture, News & Urban Life')
  const [isGeneratingPack, setIsGeneratingPack] = useState(false)

  const activeVideo = videos.find(v => v.id === selectedVideoId) || videos[0]
  const activeSegment =
    activeVideo?.segments?.[activeSegmentIdx] || activeVideo?.segments?.[0]

  const handleCheckDictation = () => {
    if (!activeSegment) return
    const alignment = alignWordSequences(activeSegment.transcript, dictationInput, false)
    setDictationResult(alignment)
  }

  const handleStartShadowing = () => {
    setShadowResult(null)
    const session = createSpeechCaptureSession({
      onInterimTranscript: txt => setShadowTranscript(txt),
      onFinalUpdate: data => setShadowTranscript(data.transcript),
    })
    session.start()
    setIsRecordingShadow(true)
    window.__ausShadowSession = session
  }

  const handleStopShadowing = () => {
    setIsRecordingShadow(false)
    let durationSec = 8
    let pauseCount = 0
    if (window.__ausShadowSession) {
      const res = window.__ausShadowSession.stop()
      if (res.transcript) setShadowTranscript(res.transcript)
      durationSec = res.durationSec
      pauseCount = res.pauseCount
    }
    if (activeSegment) {
      const align = alignWordSequences(activeSegment.transcript, shadowTranscript, false)
      const fp = evaluateFluencyAndPronunciation({
        transcript: shadowTranscript,
        durationSec,
        pauseCount,
        accuracyRatio: align.accuracyRatio,
      })
      setShadowResult({ align, fp })
    }
  }

  const handleSaveWordToDeck = wordObj => {
    if (!onSaveVocabCard) return
    const card = {
      id: `voc_yt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      word: wordObj.word,
      phoneticAu: wordObj.phoneticAu || '',
      category: wordObj.category || 'Aussie Listening Lab',
      topic: activeVideo?.topic || 'Australian English',
      meaningEn: wordObj.meaningEn || '',
      australianContext: wordObj.australianContext || '',
      exampleSentence: wordObj.exampleSentence || '',
      synonyms: wordObj.synonyms || [],
      collocations: wordObj.collocations || [],
      fsrs: initCard(Date.now()),
    }
    onSaveVocabCard(card)
    setAddedWordsMap(prev => ({ ...prev, [wordObj.word]: true }))
  }

  const handleAddYoutubeVideo = async e => {
    e.preventDefault()
    if (!newYtTitle.trim()) return
    setIsGeneratingPack(true)
    try {
      const youtubeId = extractYoutubeId(newYtUrl)
      const pack = await generateYoutubeListeningPack({
        youtubeId,
        title: newYtTitle,
        topic: newYtTopic,
      })
      if (onAddCustomVideo) {
        await onAddCustomVideo(pack)
      }
      setSelectedVideoId(pack.id)
      setActiveSegmentIdx(0)
      setShowAddModal(false)
      setNewYtUrl('')
      setNewYtTitle('')
    } catch {
      // Fallback custom video if offline
      const youtubeId = extractYoutubeId(newYtUrl)
      const fallbackVideo = {
        id: `yt_custom_${Date.now()}`,
        youtubeId,
        title: newYtTitle,
        channel: 'Custom Australian YouTube',
        accentRegion: 'General Australian',
        topic: newYtTopic,
        difficulty: 'C1',
        segments: [
          {
            id: 's1',
            startSec: 10,
            endSec: 25,
            transcript: 'Regional infrastructure investment across Australia supports renewable energy transition and local employment.',
            phoneticNote: 'Non-rhotic endings in "infrastructure" and "Australia".',
          },
        ],
        comprehensionQuestions: [],
        vocabulary: [],
      }
      if (onAddCustomVideo) await onAddCustomVideo(fallbackVideo)
      setSelectedVideoId(fallbackVideo.id)
      setShowAddModal(false)
    } finally {
      setIsGeneratingPack(false)
    }
  }

  if (!activeVideo) return null

  const embedUrl = `https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?start=${
    activeSegment?.startSec || 0
  }`

  return (
    <div className="aussie-listening-view">
      <div className="practice-controls-bar">
        <div>
          <h2>
            <Video size={22} /> Australian Accent YouTube Listening Lab
          </h2>
          <p className="subtle-caption">
            Train your ear on General, Broad & Cultivated Australian English with segment dictation,
            phonetic linking notes, voice shadowing, and 1-click vocabulary extraction.
          </p>
        </div>
        <button
          type="button"
          className="btn-ai-generate"
          onClick={() => setShowAddModal(v => !v)}
        >
          <PlusCircle size={16} /> Add YouTube Video + AI Exercises
        </button>
      </div>

      {showAddModal && (
        <form className="ai-generator-drawer" onSubmit={handleAddYoutubeVideo}>
          <h4>
            <Sparkles size={16} /> Add Custom Australian YouTube Video & Generate AI Exercises
          </h4>
          <div className="ai-gen-fields">
            <div className="form-group">
              <label>YouTube URL or 11-char Video ID</label>
              <input
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={newYtUrl}
                onChange={e => setNewYtUrl(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Video Title</label>
              <input
                type="text"
                placeholder="e.g., ABC Melbourne Housing Report"
                value={newYtTitle}
                onChange={e => setNewYtTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group flex-grow">
              <label>Topic / Australian Context</label>
              <input
                type="text"
                value={newYtTopic}
                onChange={e => setNewYtTopic(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="btn-primary-submit"
              disabled={isGeneratingPack}
            >
              <Sparkles size={16} />
              <span>{isGeneratingPack ? 'Building AI Lab...' : 'Add Video'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Video Selector Pills */}
      <div className="task-type-pills-scroll">
        {videos.map(v => (
          <button
            key={v.id}
            type="button"
            className={`task-type-chip ${v.id === activeVideo.id ? 'active' : ''}`}
            onClick={() => {
              setSelectedVideoId(v.id)
              setActiveSegmentIdx(0)
              setDictationInput('')
              setDictationResult(null)
              setShadowResult(null)
            }}
          >
            <strong>{v.channel}</strong> — {v.title}
          </button>
        ))}
      </div>

      <div className="youtube-lab-grid">
        {/* Left Column: Embedded YouTube Player + Segment Dictation & Shadowing */}
        <div className="youtube-player-column">
          <div className="youtube-iframe-wrapper">
            <iframe
              title={activeVideo.title}
              src={embedUrl}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="video-meta-strip">
            <span className="pte-section-pill section-listening">
              {activeVideo.accentRegion}
            </span>
            <span className="pte-difficulty-pill">{activeVideo.difficulty}</span>
            <span className="video-topic-tag">{activeVideo.topic}</span>
          </div>

          {/* Segment Selector & Dictation Drill */}
          {activeSegment && (
            <div className="segment-drill-card">
              <div className="segment-tabs">
                {(activeVideo.segments || []).map((seg, i) => (
                  <button
                    key={seg.id || i}
                    type="button"
                    className={`seg-tab-btn ${i === activeSegmentIdx ? 'active' : ''}`}
                    onClick={() => {
                      setActiveSegmentIdx(i)
                      setDictationInput('')
                      setDictationResult(null)
                      setShadowResult(null)
                    }}
                  >
                    Segment #{i + 1} ({seg.startSec}s–{seg.endSec}s)
                  </button>
                ))}
              </div>

              <div className="segment-audio-actions">
                <button
                  type="button"
                  className="btn-aussie-audio"
                  onClick={() => speakAustralianEnglish(activeSegment.transcript)}
                >
                  <Volume2 size={17} />
                  <span>Replay Segment in Clear Australian Voice (en-AU)</span>
                </button>
              </div>

              {/* 1. Dictation Challenge */}
              <div className="drill-box">
                <h4>
                  <Headphones size={16} /> 1. Aussie Ear Dictation Challenge
                </h4>
                <textarea
                  rows={2}
                  className="pte-textarea"
                  placeholder="Type what you hear in this segment to test your Australian listening accuracy..."
                  value={dictationInput}
                  onChange={e => setDictationInput(e.target.value)}
                />
                <div className="drill-actions-row">
                  <button
                    type="button"
                    className="btn-primary-submit"
                    onClick={handleCheckDictation}
                  >
                    Check Dictation & Reveal Phonetic Notes
                  </button>
                </div>

                {dictationResult && (
                  <div className="dictation-feedback-box">
                    <p>
                      <strong>Accuracy:</strong> {dictationResult.matchedCount}/
                      {dictationResult.totalRefWords} words (
                      {Math.round(dictationResult.accuracyRatio * 100)}%)
                    </p>
                    <div className="word-diff-tokens">
                      {dictationResult.diff.map((t, idx) => (
                        <span key={idx} className={`diff-token diff-${t.status}`}>
                          {t.word}
                        </span>
                      ))}
                    </div>
                    <div className="phonetic-coach-note">
                      <strong>Australian Phonetic Insight:</strong> {activeSegment.phoneticNote}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Australian Accent Shadowing */}
              <div className="drill-box">
                <h4>
                  <Mic size={16} /> 2. Australian Accent Shadowing & Pronunciation Score
                </h4>
                <div className="speaking-controls-row">
                  {!isRecordingShadow ? (
                    <button
                      type="button"
                      className="btn-record-start"
                      onClick={handleStartShadowing}
                    >
                      <Mic size={16} /> Shadow This Segment Aloud
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn-record-stop"
                      onClick={handleStopShadowing}
                    >
                      <Square size={16} /> Stop & Score Shadowing
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  className="pte-textarea"
                  placeholder="Spoken shadowing transcript (or type to test)..."
                  value={shadowTranscript}
                  onChange={e => setShadowTranscript(e.target.value)}
                />
                {shadowResult && (
                  <div className="dictation-feedback-box">
                    <p>
                      <strong>Pronunciation:</strong> {shadowResult.fp.pronunciation}/5 •{' '}
                      <strong>Oral Fluency:</strong> {shadowResult.fp.oralFluency}/5 (
                      {shadowResult.fp.wpm} WPM)
                    </p>
                    <p className="subtle-caption">{shadowResult.fp.fluencyComment}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Comprehension Quiz + Aussie Slang/Academic Vocabulary Extractor */}
        <div className="youtube-side-column">
          <div className="section-block">
            <h3>Listening Comprehension Quiz</h3>
            {(activeVideo.comprehensionQuestions || []).map((q, qIdx) => {
              const picked = quizAnswers[`${activeVideo.id}_${qIdx}`]
              return (
                <div key={qIdx} className="quiz-question-block">
                  <p className="quiz-q-title">
                    {qIdx + 1}. {q.question}
                  </p>
                  <div className="quiz-options-stack">
                    {(q.options || []).map((optText, oIdx) => {
                      const isPicked = picked === oIdx
                      const isRight = oIdx === q.correctIndex
                      let cls = 'quiz-opt-btn'
                      if (picked !== undefined) {
                        if (isRight) cls += ' correct'
                        else if (isPicked) cls += ' wrong'
                      }
                      return (
                        <button
                          key={oIdx}
                          type="button"
                          className={cls}
                          onClick={() =>
                            setQuizAnswers(prev => ({
                              ...prev,
                              [`${activeVideo.id}_${qIdx}`]: oIdx,
                            }))
                          }
                        >
                          {optText}
                        </button>
                      )
                    })}
                  </div>
                  {picked !== undefined && (
                    <p className="quiz-explanation">{q.explanation}</p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="section-block">
            <h3>Australian Expressions & Key Vocabulary</h3>
            <p className="subtle-caption">
              One-click save into your FSRS-5 Spaced Repetition Flashcard deck:
            </p>
            <div className="yt-vocab-list">
              {(activeVideo.vocabulary || []).map(voc => {
                const isSaved = addedWordsMap[voc.word]
                return (
                  <div key={voc.word} className="yt-vocab-card">
                    <div className="yt-vocab-top">
                      <div>
                        <strong>{voc.word}</strong>{' '}
                        <span className="phonetic-span">{voc.phoneticAu}</span>
                      </div>
                      <button
                        type="button"
                        className="btn-save-flashcard"
                        disabled={isSaved}
                        onClick={() => handleSaveWordToDeck(voc)}
                      >
                        {isSaved ? (
                          <>
                            <CheckCircle2 size={14} /> Saved to Deck
                          </>
                        ) : (
                          <>
                            <BookmarkPlus size={14} /> + Flashcard
                          </>
                        )}
                      </button>
                    </div>
                    <p className="yt-vocab-meaning">{voc.meaningEn}</p>
                    <p className="yt-vocab-context">
                      <em>Aussie Context:</em> {voc.australianContext}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
