import React, { useState, useEffect, useMemo } from 'react'
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
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  RotateCcw,
  Search,
  BookOpen,
  HelpCircle,
  ExternalLink,
} from 'lucide-react'
import { alignWordSequences, evaluateFluencyAndPronunciation } from '../scoring/pteScoringEngine'
import {
  speakAustralianEnglish,
  createSpeechCaptureSession,
} from '../utils/aussieAudio'
import { generateYoutubeListeningPack } from '../utils/geminiClient'

function extractYoutubeId(input = '') {
  const trimmed = input.trim()
  const reg = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  const match = trimmed.match(reg)
  if (match) return match[1]
  if (/^[A-Za-z0-9_-]{11}$/.test(trimmed)) return trimmed
  return 'OgVW3qQwCoA'
}

function formatTime(seconds = 0) {
  const s = Math.max(0, Math.floor(seconds))
  const mins = Math.floor(s / 60)
  const secs = s % 60
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`
}

export default function AussieListeningView({
  videos = [],
  attempts = [],
  onRecordAttempt,
  onAddCustomVideo,
  onSaveVocabCard,
}) {
  // Navigation State: null = Catalog / Gallery View; string = Dedicated Activity Page
  const [activeVideoId, setActiveVideoId] = useState(() => {
    const hash = window.location.hash || ''
    if (hash.startsWith('#aussie-lab/')) {
      const vid = hash.replace('#aussie-lab/', '').trim()
      if (vid && videos.some(v => v.id === vid)) return vid
    }
    return null
  })

  // Catalog Filters
  const [catalogChannel, setCatalogChannel] = useState('ALL')
  const [catalogAccent, setCatalogAccent] = useState('ALL')
  const [catalogSearch, setCatalogSearch] = useState('')

  // Dedicated Activity Page State
  const [activeSegmentIdx, setActiveSegmentIdx] = useState(0)
  const [activeWorkTab, setActiveWorkTab] = useState('dictation') // 'dictation' | 'shadowing' | 'quiz' | 'vocab' | 'history'
  const [cueKey, setCueKey] = useState(0)

  // Dictation State
  const [dictationInput, setDictationInput] = useState('')
  const [dictationResult, setDictationResult] = useState(null)

  // Shadowing State
  const [shadowTranscript, setShadowTranscript] = useState('')
  const [isRecordingShadow, setIsRecordingShadow] = useState(false)
  const [shadowResult, setShadowResult] = useState(null)

  // Quiz & Vocabulary State
  const [quizAnswers, setQuizAnswers] = useState({})
  const [addedWordsMap, setAddedWordsMap] = useState({})

  // Add Custom Video Modal / Drawer State
  const [showAddModal, setShowAddModal] = useState(false)
  const [newYtUrl, setNewYtUrl] = useState('')
  const [newYtTitle, setNewYtTitle] = useState('')
  const [newYtTopic, setNewYtTopic] = useState('Australian Culture, News & Rural Economics')
  const [isGeneratingPack, setIsGeneratingPack] = useState(false)

  // Listen to browser hash changes for seamless back/forward navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash || ''
      if (hash.startsWith('#aussie-lab/')) {
        const vid = hash.replace('#aussie-lab/', '').trim()
        if (vid && videos.some(v => v.id === vid)) {
          setActiveVideoId(vid)
          return
        }
      }
      if (hash === '#aussie-lab' || hash === '') {
        setActiveVideoId(null)
      }
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [videos])

  // Channels & Accents derived lists
  const channels = useMemo(() => {
    return ['ALL', ...Array.from(new Set(videos.map(v => v.channel || 'Other')))]
  }, [videos])

  const accents = useMemo(() => {
    return ['ALL', ...Array.from(new Set(videos.map(v => v.accentRegion || 'General Australian')))]
  }, [videos])

  // Filtered list of videos for the catalog
  const filteredVideos = useMemo(() => {
    const qLower = catalogSearch.trim().toLowerCase()
    return videos.filter(v => {
      if (catalogChannel !== 'ALL' && v.channel !== catalogChannel) return false
      if (catalogAccent !== 'ALL' && v.accentRegion !== catalogAccent) return false
      if (qLower) {
        const matchTitle = String(v.title || '').toLowerCase().includes(qLower)
        const matchChannel = String(v.channel || '').toLowerCase().includes(qLower)
        const matchTopic = String(v.topic || '').toLowerCase().includes(qLower)
        if (!matchTitle && !matchChannel && !matchTopic) return false
      }
      return true
    })
  }, [videos, catalogChannel, catalogAccent, catalogSearch])

  // Dedicated Active Video Object & Navigation Indices
  const activeVideo = useMemo(() => {
    if (!activeVideoId) return null
    return videos.find(v => v.id === activeVideoId) || videos[0]
  }, [videos, activeVideoId])

  const currentIndex = useMemo(() => {
    if (!activeVideo) return -1
    return filteredVideos.findIndex(v => v.id === activeVideo.id)
  }, [filteredVideos, activeVideo])

  const prevVideo = currentIndex > 0 ? filteredVideos[currentIndex - 1] : null
  const nextVideo =
    currentIndex >= 0 && currentIndex < filteredVideos.length - 1
      ? filteredVideos[currentIndex + 1]
      : null

  const activeSegment =
    activeVideo?.segments?.[activeSegmentIdx] || activeVideo?.segments?.[0]
  const activeSegmentItemId =
    activeVideo && activeSegment ? `${activeVideo.id}_${activeSegment.id}` : ''
  const segmentAttempts = attempts.filter(a => a.itemId === activeSegmentItemId)

  // Navigation handlers
  const handleOpenVideoActivity = videoId => {
    setActiveVideoId(videoId)
    setActiveSegmentIdx(0)
    setDictationInput('')
    setDictationResult(null)
    setShadowTranscript('')
    setShadowResult(null)
    setActiveWorkTab('dictation')
    setCueKey(prev => prev + 1)
    window.location.hash = `#aussie-lab/${videoId}`
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {}
  }

  const handleBackToCatalog = () => {
    setActiveVideoId(null)
    setDictationInput('')
    setDictationResult(null)
    setShadowTranscript('')
    setShadowResult(null)
    window.location.hash = '#aussie-lab'
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch {}
  }

  const handleSelectSegment = index => {
    setActiveSegmentIdx(index)
    setDictationInput('')
    setDictationResult(null)
    setShadowTranscript('')
    setShadowResult(null)
    setCueKey(prev => prev + 1)
  }

  // Dictation evaluation
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

  // Shadowing Handlers
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
          feedback: `Aussie Shadowing: Pron ${fp.pronunciation}/5 • Fluency ${fp.oralFluency}/5 (${fp.wpm} WPM).`,
          createdAt: new Date().toISOString(),
        })
      }
    }
  }

  // Vocab Flashcard Saver
  const handleSaveWordToDeck = async voc => {
    if (onSaveVocabCard) {
      await onSaveVocabCard({
        id: `card_yt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        word: voc.word,
        phonetic: voc.phoneticAu,
        meaning: voc.meaningEn,
        exampleSentence: voc.exampleSentence || '',
        category: voc.category || 'Aussie Listening',
        topic: voc.topic || 'Australian English',
        australianContext: voc.australianContext || '',
        synonyms: voc.synonyms || [],
        collocations: voc.collocations || [],
      })
      setAddedWordsMap(prev => ({ ...prev, [voc.word]: true }))
    }
  }

  // Custom Video Generator
  const handleAddCustomVideoSubmit = async e => {
    e.preventDefault()
    if (!newYtUrl.trim()) return
    setIsGeneratingPack(true)
    try {
      const ytId = extractYoutubeId(newYtUrl)
      const pack = await generateYoutubeListeningPack(
        newYtUrl,
        newYtTitle || 'Australian Regional & Cultural Practice',
        newYtTopic
      )
      const newVideo = {
        id: `yt_custom_${Date.now()}`,
        youtubeId: ytId,
        title: pack.title || newYtTitle || 'Australian Listening Lab Video',
        channel: pack.channel || 'Community / YouTube',
        accentRegion: pack.accentRegion || 'General Australian',
        topic: pack.topic || newYtTopic,
        difficulty: pack.difficulty || 'C1',
        segments: pack.segments || [
          {
            id: 'seg_1',
            startSec: 10,
            endSec: 35,
            transcript:
              'Australian English features characteristic vowel shifts, connected speech, and distinctive rural and urban vernacular.',
            phoneticNote: 'Listen for non-rhotic vowels and flapped intervocalic T.',
          },
        ],
        comprehensionQuestions: pack.comprehensionQuestions || [],
        vocabulary: pack.vocabulary || [],
      }
      if (onAddCustomVideo) {
        await onAddCustomVideo(newVideo)
      }
      setShowAddModal(false)
      setNewYtUrl('')
      setNewYtTitle('')
      handleOpenVideoActivity(newVideo.id)
    } catch (err) {
      console.error(err)
      alert('Could not generate listening pack with Gemini AI: ' + err.message)
    } finally {
      setIsGeneratingPack(false)
    }
  }

  // Total user attempts stats on video lab
  const totalLabAttempts = useMemo(() => {
    return attempts.filter(a => a.taskType === 'yt_dictation' || a.taskType === 'yt_shadowing').length
  }, [attempts])

  // =========================================================================
  // RENDER 1: CATÁLOGO DE ACTIVIDADES VÍDEO (Activity Hub / Catalog)
  // =========================================================================
  if (!activeVideoId || !activeVideo) {
    return (
      <div className="aussie-catalog-view">
        {/* Hero Section */}
        <div className="aussie-catalog-hero">
          <div className="aussie-catalog-hero-text">
            <h2>Australian Accent YouTube Listening Lab</h2>
            <p>
              Inmersión en habla australiana real y conectada: agricultura lechera, irrigación, pastos, ciencia CSIRO y noticias.
              Cada actividad cuenta con su propia <strong>página de práctica dedicada</strong> con control por segundos, dictado fonético, shadowing acústico y vocabulario FSRS-5.
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
              <span className="pte-section-pill section-listening">
                📺 {videos.length} Actividades Disponibles
              </span>
              <span className="pte-difficulty-pill">
                🎧 {totalLabAttempts} Intentos Completados
              </span>
              <span className="video-topic-tag">
                🇦🇺 Victoria, NSW & Contraste Dialectal NZ
              </span>
            </div>
          </div>
          <button
            type="button"
            className="btn-ai-generate"
            onClick={() => setShowAddModal(v => !v)}
          >
            <Sparkles size={16} />
            <span>Añadir Nuevo Vídeo con IA</span>
          </button>
        </div>

        {/* Modal / Drawer to add custom YouTube video */}
        {showAddModal && (
          <form className="ai-generator-drawer" onSubmit={handleAddCustomVideoSubmit}>
            <h4>
              <PlusCircle size={17} /> Analizar y Generar Actividad desde YouTube con Gemini AI
            </h4>
            <div className="ai-gen-fields">
              <div className="form-group flex-grow">
                <label>Enlace de YouTube (URL o Video ID)</label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=... o ID de 11 caracteres"
                  value={newYtUrl}
                  onChange={e => setNewYtUrl(e.target.value)}
                  required
                />
              </div>
              <div className="form-group flex-grow">
                <label>Título del Vídeo</label>
                <input
                  type="text"
                  placeholder="e.g., Australian Dairy Farming, Irrigation & Pastures"
                  value={newYtTitle}
                  onChange={e => setNewYtTitle(e.target.value)}
                />
              </div>
              <div className="form-group flex-grow">
                <label>Tema o Contexto Cultural Australiano</label>
                <input
                  type="text"
                  placeholder="e.g., Rural Economics, Wildlife, CSIRO Science..."
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
                <span>{isGeneratingPack ? 'Procesando Vídeo...' : 'Generar Actividad'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Filter Bar */}
        <div className="aussie-catalog-hero" style={{ padding: '0.85rem 1.25rem', gap: '0.85rem' }}>
          <div className="aussie-catalog-filters-row" style={{ width: '100%' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search
                size={16}
                style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}
              />
              <input
                type="search"
                className="aussie-catalog-search-input"
                style={{ paddingLeft: '2.2rem' }}
                placeholder="Buscar por título, canal, temas (dairy, silage, race, heifers, CSIRO)..."
                value={catalogSearch}
                onChange={e => setCatalogSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
              {channels.map(ch => {
                const count = ch === 'ALL' ? videos.length : videos.filter(v => v.channel === ch).length
                const label = ch === 'ALL' ? `Todos (${count})` : `${ch} (${count})`
                return (
                  <button
                    key={ch}
                    type="button"
                    className={`section-tab ${catalogChannel === ch ? 'active' : ''}`}
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
                    onClick={() => setCatalogChannel(ch)}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Activities Grid */}
        <div className="aussie-catalog-grid">
          {filteredVideos.map((v, idx) => {
            const segCount = v.segments?.length || 0
            const totalSec = (v.segments || []).reduce((acc, s) => acc + (s.endSec - s.startSec), 0)
            const videoAttempts = attempts.filter(a =>
              (v.segments || []).some(s => a.itemId === `${v.id}_${s.id}`)
            )
            const bestPct =
              videoAttempts.length > 0
                ? Math.max(...videoAttempts.map(a => a.scores?.percentage || 0))
                : null

            return (
              <div
                key={v.id}
                className="aussie-activity-card"
                onClick={() => handleOpenVideoActivity(v.id)}
              >
                {/* Thumbnail Preview with Overlays */}
                <div className="aussie-card-thumb-container">
                  <img
                    className="aussie-card-thumb-img"
                    src={`https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`}
                    alt={v.title}
                    loading="lazy"
                  />
                  <span className="aussie-card-badge-top-left">
                    {v.accentRegion.includes('New Zealand') ? '🇳🇿 NZ Dialect' : '🇦🇺 Aussie English'}
                  </span>
                  <span className="aussie-card-badge-bottom-right">
                    <Clock size={12} /> {segCount} segm • {totalSec}s
                  </span>
                  <div className="aussie-card-play-icon">
                    <Play size={22} fill="#FFFFFF" />
                  </div>
                </div>

                {/* Card Body */}
                <div className="aussie-card-body">
                  <span className="aussie-card-channel-pill">{v.channel}</span>
                  <h3 className="aussie-card-title">{v.title}</h3>
                  <p className="aussie-card-topic">{v.topic}</p>

                  {/* Segments Preview */}
                  <div className="aussie-card-segments-bar">
                    {(v.segments || []).slice(0, 3).map((seg, sIdx) => (
                      <span key={seg.id || sIdx} className="aussie-card-seg-pill">
                        ⏱️ {formatTime(seg.startSec)}–{formatTime(seg.endSec)} ({seg.endSec - seg.startSec}s)
                      </span>
                    ))}
                  </div>

                  {/* Attempt status */}
                  {videoAttempts.length > 0 ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: '#16A34A', fontWeight: 600 }}>
                      <span><CheckCircle2 size={13} style={{ display: 'inline', verticalAlign: '-1px' }} /> {videoAttempts.length} intentos</span>
                      <span>Mejor: {bestPct}%</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                      ⏳ Actividad pendiente de practicar
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="aussie-card-btn-action">
                    <span>Entrar a la Actividad</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {filteredVideos.length === 0 && (
          <div className="empty-state-box">
            No se encontraron actividades con ese criterio. Prueba a cambiar el canal o la búsqueda.
          </div>
        )}
      </div>
    )
  }

  // =========================================================================
  // RENDER 2: PÁGINA DEDICADA DE LA ACTIVIDAD VÍDEO
  // =========================================================================
  const embedUrl = `https://www.youtube-nocookie.com/embed/${activeVideo.youtubeId}?start=${
    activeSegment?.startSec || 0
  }&rel=0&modestbranding=1&autoplay=0`
  const watchUrl = `https://www.youtube.com/watch?v=${activeVideo.youtubeId}&t=${activeSegment?.startSec || 0}s`

  return (
    <div className="activity-page-view">
      {/* 1. Header de Navegación & Control entre Actividades */}
      <div className="activity-page-top-nav">
        <button
          type="button"
          className="activity-back-catalog-btn"
          onClick={handleBackToCatalog}
        >
          <ArrowLeft size={16} />
          <span>Volver al Catálogo de Actividades</span>
        </button>

        {/* Switcher & Selector entre Actividades */}
        <div className="activity-page-switcher">
          <button
            type="button"
            className="activity-switcher-btn"
            disabled={!prevVideo}
            title={prevVideo ? `Actividad anterior: ${prevVideo.title}` : 'Primera actividad'}
            onClick={() => prevVideo && handleOpenVideoActivity(prevVideo.id)}
          >
            <ChevronLeft size={15} />
            <span>Anterior</span>
          </button>

          <select
            className="activity-switcher-select"
            value={activeVideo.id}
            onChange={e => handleOpenVideoActivity(e.target.value)}
          >
            {filteredVideos.map((v, i) => (
              <option key={v.id} value={v.id}>
                {i + 1}. {v.channel} — {v.title.slice(0, 36)}...
              </option>
            ))}
          </select>

          <button
            type="button"
            className="activity-switcher-btn"
            disabled={!nextVideo}
            title={nextVideo ? `Siguiente actividad: ${nextVideo.title}` : 'Última actividad'}
            onClick={() => nextVideo && handleOpenVideoActivity(nextVideo.id)}
          >
            <span>Siguiente</span>
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      {/* 2. Video Hero Strip */}
      <div className="activity-hero-strip">
        <div className="activity-hero-title-row">
          <div>
            <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
              <span className="pte-code-pill">{activeVideo.channel}</span>
              <span className="pte-section-pill section-listening">{activeVideo.accentRegion}</span>
              <span className="pte-difficulty-pill">{activeVideo.difficulty}</span>
              <span className="video-topic-tag">{activeVideo.topic}</span>
            </div>
            <h2>{activeVideo.title}</h2>
          </div>

          <a
            href={watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary-small"
            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
          >
            <span>Abrir en YouTube</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {/* 3. The Video Player */}
      <div className="youtube-iframe-wrapper">
        <iframe
          key={`${activeVideo.youtubeId}_${activeSegment?.startSec || 0}_${cueKey}`}
          title={activeVideo.title}
          src={embedUrl}
          referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      {/* 4. Barra de Tiempo y Control de Segundos ("desde allí salgan los segundos, etc.") */}
      <div className="activity-seconds-timeline-card">
        <div className="timeline-header-row">
          <h4>
            <Clock size={18} style={{ color: '#0F766E' }} />
            <span>Timeline de Segundos de Escucha ({activeVideo.segments?.length || 0} Segmentos Disponibles)</span>
          </h4>
          <span style={{ fontSize: '0.8rem', color: '#0F766E', fontWeight: 600 }}>
            💡 Clica en cualquier segmento para saltar al segundo exacto en el reproductor
          </span>
        </div>

        {/* Segments Track with Formatted Seconds */}
        <div className="timeline-segments-track">
          {(activeVideo.segments || []).map((seg, i) => {
            const isCurrent = i === activeSegmentIdx
            const durationSec = seg.endSec - seg.startSec
            const segItemId = `${activeVideo.id}_${seg.id}`
            const hasAttempts = attempts.some(a => a.itemId === segItemId)

            return (
              <div
                key={seg.id || i}
                className={`timeline-segment-box ${isCurrent ? 'active' : ''}`}
                onClick={() => handleSelectSegment(i)}
              >
                <div className="timeline-segment-box-top">
                  <span className="timeline-segment-num">Segmento #{i + 1}</span>
                  <span className="timeline-segment-seconds-badge">
                    ⏱️ {durationSec}s de audio
                  </span>
                </div>
                <div className="timeline-segment-time-range">
                  {formatTime(seg.startSec)} → {formatTime(seg.endSec)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                  <span className="timeline-segment-jump-cue">
                    <Play size={11} /> {seg.startSec} seg ({formatTime(seg.startSec)})
                  </span>
                  {hasAttempts ? (
                    <span style={{ fontSize: '0.72rem', color: '#16A34A', fontWeight: 700 }}>
                      ✓ Hecho
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.72rem', color: '#9CA3AF' }}>
                      Pendiente
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Active Segment Cue Bar */}
        {activeSegment && (
          <div className="active-segment-cue-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F766E' }}>
                Segmento Activo #{activeSegmentIdx + 1}:
              </span>
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#111827', fontFamily: 'monospace' }}>
                {formatTime(activeSegment.startSec)} a {formatTime(activeSegment.endSec)}
              </span>
              <span className="pte-code-pill" style={{ fontSize: '0.76rem' }}>
                Duración: {activeSegment.endSec - activeSegment.startSec} segundos
              </span>
            </div>

            <div style={{ display: 'flex', gap: '0.45rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-secondary-small"
                disabled={activeSegmentIdx <= 0}
                onClick={() => handleSelectSegment(activeSegmentIdx - 1)}
              >
                <ChevronLeft size={14} /> Anterior ({formatTime(activeVideo.segments?.[activeSegmentIdx - 1]?.startSec || 0)}s)
              </button>
              <button
                type="button"
                className="btn-secondary-small"
                onClick={() => setCueKey(k => k + 1)}
              >
                <RotateCcw size={14} /> Repetir ({activeSegment.startSec}s–{activeSegment.endSec}s)
              </button>
              <button
                type="button"
                className="btn-secondary-small"
                disabled={activeSegmentIdx >= (activeVideo.segments?.length || 0) - 1}
                onClick={() => handleSelectSegment(activeSegmentIdx + 1)}
              >
                Siguiente ({formatTime(activeVideo.segments?.[activeSegmentIdx + 1]?.startSec || 0)}s) <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Workstation Tabs (Pestañas Organizadas - Cero saturación) */}
      <div className="segment-drill-card" style={{ padding: '1.25rem' }}>
        <div className="activity-workstation-tabs-nav">
          <button
            type="button"
            className={`activity-work-tab-btn ${activeWorkTab === 'dictation' ? 'active' : ''}`}
            onClick={() => setActiveWorkTab('dictation')}
          >
            <Headphones size={16} />
            <span>1. Dictado del Segmento ({activeSegment ? activeSegment.endSec - activeSegment.startSec : 0} seg)</span>
          </button>
          <button
            type="button"
            className={`activity-work-tab-btn ${activeWorkTab === 'shadowing' ? 'active' : ''}`}
            onClick={() => setActiveWorkTab('shadowing')}
          >
            <Mic size={16} />
            <span>2. Shadowing y Articulación</span>
          </button>
          <button
            type="button"
            className={`activity-work-tab-btn ${activeWorkTab === 'quiz' ? 'active' : ''}`}
            onClick={() => setActiveWorkTab('quiz')}
          >
            <HelpCircle size={16} />
            <span>3. Quiz de Comprensión ({activeVideo.comprehensionQuestions?.length || 0})</span>
          </button>
          <button
            type="button"
            className={`activity-work-tab-btn ${activeWorkTab === 'vocab' ? 'active' : ''}`}
            onClick={() => setActiveWorkTab('vocab')}
          >
            <BookOpen size={16} />
            <span>4. Vocabulario Australiano ({activeVideo.vocabulary?.length || 0})</span>
          </button>
          <button
            type="button"
            className={`activity-work-tab-btn ${activeWorkTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveWorkTab('history')}
          >
            <History size={16} />
            <span>5. Historial ({segmentAttempts.length})</span>
          </button>
        </div>

        {/* TAB 1: DICTATION */}
        {activeWorkTab === 'dictation' && activeSegment && (
          <div className="drill-box" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h4 style={{ margin: 0 }}>
                  <Headphones size={17} style={{ color: '#0F766E' }} /> Dictado del Segmento #{activeSegmentIdx + 1}
                </h4>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.82rem', color: '#6B7280' }}>
                  Escucha el fragmento de {activeSegment.endSec - activeSegment.startSec} segundos y escribe exactamente lo que oyes para entrenar discriminación fonética.
                </p>
              </div>

              {/* Natural AI Voice Replay Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-aussie-audio"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
                  onClick={() => speakAustralianEnglish(activeSegment.transcript, { rate: 1.0 })}
                >
                  <Volume2 size={15} />
                  <span>Voz Australiana IA (1.0x)</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary-small"
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
                  onClick={() => speakAustralianEnglish(activeSegment.transcript, { rate: 0.85 })}
                >
                  <Volume2 size={14} />
                  <span>Lento & Claro (0.85x)</span>
                </button>
              </div>
            </div>

            <textarea
              rows={3}
              className="pte-textarea"
              placeholder="Escribe aquí las palabras exactas que pronuncia el hablante en este segmento..."
              value={dictationInput}
              onChange={e => setDictationInput(e.target.value)}
            />

            <div className="drill-actions-row" style={{ marginTop: '0.75rem' }}>
              <button
                type="button"
                className="btn-primary-submit"
                onClick={handleCheckDictation}
              >
                Comprobar Dictado & Revelar Notas Fonéticas
              </button>
            </div>

            {dictationResult && (
              <div className="dictation-feedback-box" style={{ marginTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.5rem' }}>
                  <strong>Exactitud del Dictado: {dictationResult.matchedCount} / {dictationResult.totalRefWords} palabras ({Math.round(dictationResult.accuracyRatio * 100)}%)</strong>
                  <span className="pte-code-pill">
                    Equivalente PTE: {Math.round(10 + dictationResult.accuracyRatio * 80)} / 90
                  </span>
                </div>
                <div className="word-diff-tokens">
                  {dictationResult.diff.map((t, idx) => (
                    <span key={idx} className={`diff-token diff-${t.status}`}>
                      {t.word}
                    </span>
                  ))}
                </div>
                <div className="phonetic-coach-note" style={{ marginTop: '0.75rem' }}>
                  <strong>Insight Fonético Australiano:</strong> {activeSegment.phoneticNote}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SHADOWING */}
        {activeWorkTab === 'shadowing' && activeSegment && (
          <div className="drill-box" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>
              <Mic size={17} style={{ color: '#16A34A' }} /> Shadowing & Articulación Oral
            </h4>
            <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.82rem', color: '#6B7280' }}>
              Repite en voz alta el segmento con el mismo ritmo y entonación. Nuestro motor acústico evaluará tu fluidez (WPM), pausas indebidas y pronunciación.
            </p>

            <div className="speaking-controls-row" style={{ marginBottom: '0.75rem' }}>
              {!isRecordingShadow ? (
                <button
                  type="button"
                  className="btn-record-start"
                  onClick={handleStartShadowing}
                >
                  <Mic size={16} /> Empezar Grabación de Shadowing
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-record-stop"
                  onClick={handleStopShadowing}
                >
                  <Square size={16} /> Detener & Evaluar Grabación
                </button>
              )}
            </div>

            <textarea
              rows={2}
              className="pte-textarea"
              placeholder="Transcripción reconocida por voz (o escribe directamente para evaluar pausas)..."
              value={shadowTranscript}
              onChange={e => setShadowTranscript(e.target.value)}
            />

            {shadowResult && (
              <div className="dictation-feedback-box" style={{ marginTop: '1rem' }}>
                <p>
                  <strong>Pronunciación:</strong> {shadowResult.fp.pronunciation} / 5 •{' '}
                  <strong>Fluidez Oral:</strong> {shadowResult.fp.oralFluency} / 5 ({shadowResult.fp.wpm} WPM) •{' '}
                  <strong>Pausas Extras:</strong> {shadowResult.fp.pauseLocations?.length || 0} detectadas
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
                            {hasLongPause ? `⚠️ +${pauseSec}s PAUSA` : `⏸ +${pauseSec}s`}
                          </span>
                        )}
                        <span className={`diff-token diff-${tok.status}`}>
                          {tok.word}
                        </span>
                      </React.Fragment>
                    )
                  })}
                </div>
                <p className="subtle-caption" style={{ marginTop: '0.5rem' }}>
                  {shadowResult.fp.fluencyComment}
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: QUIZ */}
        {activeWorkTab === 'quiz' && (
          <div className="drill-box" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>
              <HelpCircle size={17} style={{ color: '#2563EB' }} /> Preguntas de Comprensión Auditiva
            </h4>
            <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.82rem', color: '#6B7280' }}>
              Verifica si has entendido los detalles técnicos, económicos y contextuales explicados en el vídeo.
            </p>

            {(activeVideo.comprehensionQuestions || []).map((q, qIdx) => {
              const picked = quizAnswers[`${activeVideo.id}_${qIdx}`]
              return (
                <div key={qIdx} className="quiz-question-block" style={{ paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <p className="quiz-q-title" style={{ fontSize: '0.92rem', fontWeight: 700 }}>
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
                    <p className="quiz-explanation" style={{ background: '#F8FAFC', padding: '0.6rem 0.8rem', borderRadius: '6px', border: '1px solid #E2E8F0', marginTop: '0.5rem' }}>
                      💡 <strong>Explicación:</strong> {q.explanation}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* TAB 4: VOCABULARY */}
        {activeWorkTab === 'vocab' && (
          <div className="drill-box" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>
              <BookOpen size={17} style={{ color: '#D97706' }} /> Vocabulario Australiano y Colocaciones
            </h4>
            <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.82rem', color: '#6B7280' }}>
              Términos clave de este vídeo. Haz clic en <strong>+ Flashcard</strong> para integrarlos automáticamente en tu mazo de repetición espaciada FSRS-5.
            </p>

            <div className="yt-vocab-list">
              {(activeVideo.vocabulary || []).map(voc => {
                const isSaved = addedWordsMap[voc.word]
                return (
                  <div key={voc.word} className="yt-vocab-card">
                    <div className="yt-vocab-top">
                      <div>
                        <strong style={{ fontSize: '1rem' }}>{voc.word}</strong>{' '}
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
                            <CheckCircle2 size={14} /> Guardada en Flashcards
                          </>
                        ) : (
                          <>
                            <BookmarkPlus size={14} /> + Añadir a Flashcards
                          </>
                        )}
                      </button>
                    </div>
                    <p className="yt-vocab-meaning" style={{ margin: '0.25rem 0' }}>{voc.meaningEn}</p>
                    <p className="yt-vocab-context" style={{ margin: '0.25rem 0', fontSize: '0.84rem' }}>
                      <em>Contexto Australiano:</em> {voc.australianContext}
                    </p>
                    {voc.exampleSentence && (
                      <p style={{ margin: '0.25rem 0', fontSize: '0.82rem', color: '#4B5563', fontStyle: 'italic' }}>
                        &ldquo;{voc.exampleSentence}&rdquo;
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 5: HISTORY */}
        {activeWorkTab === 'history' && (
          <div className="drill-box" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>
              <History size={17} /> Historial de Intentos del Segmento #{activeSegmentIdx + 1}
            </h4>
            {segmentAttempts.length === 0 ? (
              <p className="subtle-caption">
                Aún no hay intentos registrados en este segmento. Realiza un dictado o un shadowing en las pestañas anteriores para guardar tu respuesta y nota.
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
                            #{attemptNum} • {att.taskType === 'yt_dictation' ? 'Dictado' : 'Shadowing'}
                          </span>
                          <span className="subtle-caption">
                            {att.createdAt ? new Date(att.createdAt).toLocaleString() : 'Reciente'}
                          </span>
                        </div>
                        <div className="history-scores-right">
                          <span className="pte-code-pill">
                            Puntuación: {att.scores?.rawScore ?? 0} / {att.scores?.maxScore ?? 10} ({att.scores?.percentage ?? 0}%)
                          </span>
                          <span className="recent-attempt-eq">
                            PTE {att.scores?.pteEquivalent ?? 10}/90
                          </span>
                        </div>
                      </div>
                      {text && (
                        <div className="history-response-box">
                          <span className="transcript-label">Respuesta guardada:</span>
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
        )}
      </div>

      {/* 6. Footer de Navegación entre Actividades */}
      <div className="activity-page-bottom-nav">
        <div>
          {prevVideo ? (
            <button
              type="button"
              className="activity-switcher-btn"
              onClick={() => handleOpenVideoActivity(prevVideo.id)}
            >
              <ChevronLeft size={16} />
              <span>Anterior: {prevVideo.channel} — {prevVideo.title.slice(0, 28)}...</span>
            </button>
          ) : (
            <span style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>Primera actividad</span>
          )}
        </div>

        <button
          type="button"
          className="activity-back-catalog-btn"
          onClick={handleBackToCatalog}
        >
          <ArrowLeft size={16} />
          <span>Volver al Catálogo de Actividades</span>
        </button>

        <div>
          {nextVideo ? (
            <button
              type="button"
              className="activity-switcher-btn"
              onClick={() => handleOpenVideoActivity(nextVideo.id)}
            >
              <span>Siguiente: {nextVideo.channel} — {nextVideo.title.slice(0, 28)}...</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <span style={{ fontSize: '0.82rem', color: '#9CA3AF' }}>Última actividad</span>
          )}
        </div>
      </div>
    </div>
  )
}
