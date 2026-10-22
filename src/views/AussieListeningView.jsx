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
  History,
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
  return 'OgVW3qQwCoA'
}

export default function AussieListeningView({
  videos = [],
  attempts = [],
  onRecordAttempt,
  onAddCustomVideo,
  onSaveVocabCard,
}) {
  const [selectedVideoId, setSelectedVideoId] = useState(videos[0]?.id || 'yt_josh_milking_01')
  const [selectedChannel, setSelectedChannel] = useState('ALL')
  const [activeSegmentIdx, setActiveSegmentIdx] = useState(0)
  const [dictationInput, setDictationInput] = useState('')
  const [dictationResult, setDictationResult] = useState(null)

  const [shadowTranscript, setShadowTranscript] = useState('')
  const [isRecordingShadow, setIsRecordingShadow] = useState(false)
  const [shadowResult, setShadowResult] = useState(null)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [addedWordsMap, setAddedWordsMap] = useState({})

  const channels = ['ALL', ...Array.from(new Set(videos.map(v => v.channel || 'Other')))]
  const filteredVideos =
    selectedChannel === 'ALL'
      ? videos
      : videos.filter(v => v.channel === selectedChannel)

  const [showAddModal, setShowAddModal] = useState(false)
  const [newYtUrl, setNewYtUrl] = useState('')
  const [newYtTitle, setNewYtTitle] = useState('')
  const [newYtTopic, setNewYtTopic] = useState('Australian Culture, News & Urban Life')
  const [isGeneratingPack, setIsGeneratingPack] = useState(false)

  const activeVideo = videos.find(v => v.id === selectedVideoId) || videos[0]
  const activeSegment =
    activeVideo?.segments?.[activeSegmentIdx] || activeVideo?.segments?.[0]
  const activeSegmentItemId =
    activeVideo && activeSegment ? `${activeVideo.id}_${activeSegment.id}` : ''
  const segmentAttempts = attempts.filter(a => a.itemId === activeSegmentItemId)

  const handleCheckDictation = () => {
    if (!activeSegment) return
    const alignment = alignWordSequences(activeSegment.transcript, dictationInput, false)
    setDictationResult(alignment)
    if (onRecordAttempt && dictationInput.trim()) {
      const pct = Math.round(alignment.accuracyRatio * 100)
      onRecordAttempt({
        id: `att_yt_dict_${Date.now()}`,
        itemId: activeSegmentItemId,
        taskType: 'yt_dictation',
        section: 'Listening',
        userResponse: { textAnswer: dictationInput },
        scores: {
          rawScore: alignment.matchedCount,
          maxScore: alignment.totalRefWords,
          percentage: pct,
          pteEquivalent: Math.round(10 + alignment.accuracyRatio * 80),
          subscores: {
            matchedWords: `${alignment.matchedCount}/${alignment.totalRefWords}`,
          },
        },
        feedback: `Aussie Dictation: ${alignment.matchedCount}/${alignment.totalRefWords} words matched (${pct}%).`,
        createdAt: new Date().toISOString(),
      })
    }
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
    let durationSec = null
    let pauseCount = 0
    let longPauseCount = 0
    let wordTimings = []
    let finalTranscript = shadowTranscript
    if (window.__ausShadowSession) {
      const res = window.__ausShadowSession.stop()
      if (res.transcript) {
        finalTranscript = res.transcript
        setShadowTranscript(res.transcript)
      }
      durationSec = res.durationSec
      pauseCount = res.pauseCount
      longPauseCount = res.longPauseCount
      wordTimings = res.wordTimings || []
    }
    if (activeSegment) {
      const align = alignWordSequences(
        activeSegment.transcript,
        finalTranscript,
        false,
        wordTimings
      )
      const fp = evaluateFluencyAndPronunciation({
        transcript: finalTranscript,
        durationSec,
        pauseCount,
        longPauseCount,
        wordTimings,
        accuracyRatio: align.accuracyRatio,
        referenceWordCount: align.totalRefWords,
      })
      setShadowResult({ align, fp })
      if (onRecordAttempt && finalTranscript.trim()) {
        const raw = Number((fp.pronunciation + fp.oralFluency).toFixed(1))
        const ratio = Math.min(1, raw / 10)
        onRecordAttempt({
          id: `att_yt_shad_${Date.now()}`,
          itemId: activeSegmentItemId,
          taskType: 'yt_shadowing',
          section: 'Speaking',
          userResponse: { transcript: finalTranscript },
          scores: {
            rawScore: raw,
            maxScore: 10,
            percentage: Math.round(ratio * 100),
            pteEquivalent: Math.round(10 + ratio * 80),
            subscores: {
              pronunciation: fp.pronunciation,
              oralFluency: fp.oralFluency,
              wpm: fp.wpm,
              extraPauses: fp.pauseLocations?.length || 0,
            },
          },
          feedback: fp.fluencyComment,
          createdAt: new Date().toISOString(),
        })
      }
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

  const embedUrl = `https://www.youtube.com/embed/${activeVideo.youtubeId}?start=${
    activeSegment?.startSec || 0
  }&rel=0&playsinline=1`
  const watchUrl = `https://www.youtube.com/watch?v=${activeVideo.youtubeId}&t=${
    activeSegment?.startSec || 0
  }s`

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

      {/* Channel Filters */}
      <div className="section-tabs" style={{ marginBottom: '0.6rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {channels.map(ch => {
          const count = ch === 'ALL' ? videos.length : videos.filter(v => v.channel === ch).length
          const label = ch === 'ALL' ? `All Channels (${count})` : `${ch} (${count})`
          return (
            <button
              key={ch}
              type="button"
              className={`section-tab ${selectedChannel === ch ? 'active' : ''}`}
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.85rem' }}
              onClick={() => {
                setSelectedChannel(ch)
                const firstInChannel = ch === 'ALL' ? videos[0] : videos.find(v => v.channel === ch)
                if (firstInChannel) {
                  setSelectedVideoId(firstInChannel.id)
                  setActiveSegmentIdx(0)
                  setDictationInput('')
                  setDictationResult(null)
                  setShadowResult(null)
                }
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Video Selector Pills */}
      <div className="task-type-pills-scroll">
        {filteredVideos.map(v => (
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
              key={`${activeVideo.youtubeId}_${activeSegment?.startSec || 0}`}
              title={activeVideo.title}
              src={embedUrl}
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="video-meta-strip" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span className="pte-section-pill section-listening">
                {activeVideo.accentRegion}
              </span>
              <span className="pte-difficulty-pill">{activeVideo.difficulty}</span>
              <span className="video-topic-tag">{activeVideo.topic}</span>
            </div>
            <a
              href={watchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary-small"
              style={{ textDecoration: 'none' }}
            >
              Open in YouTube ↗
            </a>
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

              <div className="segment-audio-actions" style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-aussie-audio"
                  onClick={() => speakAustralianEnglish(activeSegment.transcript, { rate: 1.0 })}
                >
                  <Volume2 size={17} />
                  <span>Play Segment with Natural AI Voice (1.0x)</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary-small"
                  onClick={() => speakAustralianEnglish(activeSegment.transcript, { rate: 0.85 })}
                >
                  <Volume2 size={15} />
                  <span>Slow & Clear (0.85x)</span>
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
                  {!isRecordingShadow && (
                    <button
                      type="button"
                      className="btn-secondary-small"
                      onClick={handleStopShadowing}
                    >
                      Evaluate Shadowing & Pause Map
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  className="pte-textarea"
                  placeholder="Spoken shadowing transcript (or type 2+ spaces between words to test pause map)..."
                  value={shadowTranscript}
                  onChange={e => setShadowTranscript(e.target.value)}
                />
                {shadowResult && (
                  <div className="dictation-feedback-box">
                    <p>
                      <strong>Pronunciation:</strong> {shadowResult.fp.pronunciation}/5 •{' '}
                      <strong>Oral Fluency:</strong> {shadowResult.fp.oralFluency}/5 (
                      {shadowResult.fp.wpm} WPM) •{' '}
                      <strong>Extra Pauses:</strong> {shadowResult.fp.pauseLocations?.length || 0}
                    </p>
                    <div className="word-diff-tokens">
                      {(shadowResult.align?.diff || []).map((tok, i) => {
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
                            <span className={`diff-token diff-${tok.status}`}>
                              {tok.word}
                            </span>
                          </React.Fragment>
                        )
                      })}
                    </div>
                    <p className="subtle-caption">{shadowResult.fp.fluencyComment}</p>
                  </div>
                )}
              </div>

              {/* 3. Segment Activity History */}
              <div className="activity-history-section">
                <div className="activity-history-header">
                  <h4>
                    <History size={16} /> Segment Activity History — Saved Responses & Scores
                  </h4>
                  <span className="pte-difficulty-pill">
                    {segmentAttempts.length}{' '}
                    {segmentAttempts.length === 1 ? 'Attempt' : 'Attempts'}
                  </span>
                </div>
                {segmentAttempts.length === 0 ? (
                  <p className="subtle-caption">
                    No saved attempts for this segment yet. Check your dictation or evaluate shadowing above to save your response and score.
                  </p>
                ) : (
                  <div className="activity-history-list">
                    {segmentAttempts.map((att, idx) => {
                      const attemptNum = segmentAttempts.length - idx
                      const text =
                        att.userResponse?.textAnswer ||
                        att.userResponse?.transcript ||
                        ''
                      return (
                        <div key={att.id || idx} className="activity-history-card">
                          <div className="history-card-top">
                            <div className="history-meta-left">
                              <span className="history-attempt-badge">
                                #{attemptNum} •{' '}
                                {att.taskType === 'yt_dictation'
                                  ? 'Dictation'
                                  : 'Shadowing'}
                              </span>
                              <span className="subtle-caption">
                                {att.createdAt
                                  ? new Date(att.createdAt).toLocaleString()
                                  : 'Just now'}
                              </span>
                            </div>
                            <div className="history-scores-right">
                              <span className="pte-code-pill">
                                Score: {att.scores?.rawScore ?? 0}/
                                {att.scores?.maxScore ?? 10} (
                                {att.scores?.percentage ?? 0}%)
                              </span>
                              <span className="recent-attempt-eq">
                                PTE {att.scores?.pteEquivalent ?? 10}/90
                              </span>
                            </div>
                          </div>
                          {text && (
                            <div className="history-response-box">
                              <span className="transcript-label">Saved Response:</span>
                              <p className="history-response-text">{text}</p>
                            </div>
                          )}
                          {att.feedback && (
                            <p className="history-feedback-note">{att.feedback}</p>
                          )}
                        </div>
                      )
                    })}
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
