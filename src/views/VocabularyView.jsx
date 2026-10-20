import React, { useState, useMemo } from 'react'
import {
  BookOpen,
  Sparkles,
  Volume2,
  RotateCcw,
  Layers,
  CheckCircle2,
  Plus,
} from 'lucide-react'
import {
  Rating,
  nextState,
  getSchedulingPreview,
  isDue,
  initCard,
} from '../utils/fsrsEngine'
import { speakAustralianEnglish } from '../utils/aussieAudio'
import { generateVocabCardsByTopic } from '../utils/geminiClient'

export default function VocabularyView({
  vocabCards = [],
  onUpdateDeck,
}) {
  const [subTab, setSubTab] = useState('review') // 'review' | 'browse' | 'ai-add'
  const [isFlipped, setIsFlipped] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  const [aiTopic, setAiTopic] = useState('PTE Academic Essay Collocations & Australian Idioms')
  const [aiCategory, setAiCategory] = useState('PTE Collocation')
  const [aiCount, setAiCount] = useState(5)
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiMessage, setAiMessage] = useState('')

  const categories = useMemo(() => {
    const set = new Set(vocabCards.map(c => c.category).filter(Boolean))
    return ['ALL', ...Array.from(set)]
  }, [vocabCards])

  const filteredCards = useMemo(() => {
    if (categoryFilter === 'ALL') return vocabCards
    return vocabCards.filter(c => c.category === categoryFilter)
  }, [vocabCards, categoryFilter])

  const dueQueue = useMemo(() => {
    return filteredCards.filter(c => isDue(c.fsrs))
  }, [filteredCards])

  const currentCard = dueQueue[0] || null

  const schedulingPreview = useMemo(() => {
    if (!currentCard) return null
    return getSchedulingPreview(currentCard.fsrs || initCard())
  }, [currentCard])

  const handleGradeCard = rating => {
    if (!currentCard) return
    const updatedFsrs = nextState(currentCard.fsrs || initCard(), rating)
    const updatedDeck = vocabCards.map(c =>
      c.id === currentCard.id ? { ...c, fsrs: updatedFsrs } : c
    )
    setIsFlipped(false)
    if (onUpdateDeck) onUpdateDeck(updatedDeck)
  }

  const handleResetDueDates = () => {
    const now = Date.now()
    const resetDeck = vocabCards.map(c => ({
      ...c,
      fsrs: initCard(now),
    }))
    setIsFlipped(false)
    if (onUpdateDeck) onUpdateDeck(resetDeck)
  }

  const handleGenerateTopicCards = async e => {
    e.preventDefault()
    if (!aiTopic.trim()) return
    setIsGenerating(true)
    setAiMessage('')
    try {
      const newCards = await generateVocabCardsByTopic(aiTopic, Number(aiCount), aiCategory)
      const merged = [...newCards, ...vocabCards]
      if (onUpdateDeck) onUpdateDeck(merged)
      setAiMessage(`Added ${newCards.length} new flashcards on "${aiTopic}" to your FSRS-5 deck!`)
      setSubTab('review')
    } catch (err) {
      setAiMessage(`Error: ${err.message}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="vocabulary-view">
      {/* Header & Sub-navigation */}
      <div className="practice-controls-bar">
        <div>
          <h2>
            <BookOpen size={22} /> FSRS-5 Vocabulary & Aussie Flashcards
          </h2>
          <p className="subtle-caption">
            Spaced repetition memory scheduler (FSRS-5) with Australian pronunciation and AI topic generator.
          </p>
        </div>

        <div className="vocab-mode-tabs">
          <button
            type="button"
            className={`sec-filter-btn ${subTab === 'review' ? 'active' : ''}`}
            onClick={() => setSubTab('review')}
          >
            Study Due ({dueQueue.length})
          </button>
          <button
            type="button"
            className={`sec-filter-btn ${subTab === 'browse' ? 'active' : ''}`}
            onClick={() => setSubTab('browse')}
          >
            <Layers size={15} /> All Cards ({vocabCards.length})
          </button>
          <button
            type="button"
            className="btn-ai-generate"
            onClick={() => setSubTab('ai-add')}
          >
            <Sparkles size={15} /> Ask AI to Add Words by Topic
          </button>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="task-type-pills-scroll">
        {categories.map(cat => (
          <button
            key={cat}
            type="button"
            className={`task-type-chip ${categoryFilter === cat ? 'active' : ''}`}
            onClick={() => {
              setCategoryFilter(cat)
              setIsFlipped(false)
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {aiMessage && (
        <div className="saved-alert">
          <CheckCircle2 size={16} /> {aiMessage}
        </div>
      )}

      {/* AI Topic Vocabulary Generator Tab */}
      {subTab === 'ai-add' && (
        <form className="ai-generator-drawer" onSubmit={handleGenerateTopicCards}>
          <h3>
            <Sparkles size={18} /> Ask Gemini AI to Add Flashcards by Topic
          </h3>
          <p className="subtle-caption">
            Enter any academic theme, PTE section, or Australian cultural topic (e.g., &ldquo;Australian Medical Hospital Slang&rdquo;, &ldquo;C2 Climate Change Essay Verbs&rdquo;, &ldquo;Mining & Civil Engineering in Perth&rdquo;).
          </p>
          <div className="ai-gen-fields">
            <div className="form-group flex-grow">
              <label>Topic or Theme</label>
              <input
                type="text"
                value={aiTopic}
                onChange={e => setAiTopic(e.target.value)}
                placeholder="e.g., Australian Slang in the Workplace, Academic Hedging Verbs..."
                required
              />
            </div>
            <div className="form-group">
              <label>Category Tag</label>
              <select
                value={aiCategory}
                onChange={e => setAiCategory(e.target.value)}
              >
                <option value="PTE Collocation">PTE Collocation</option>
                <option value="Academic Word List">Academic Word List (C1/C2)</option>
                <option value="Aussie Idiom">Aussie Idiom & Slang</option>
                <option value="Essay Discourse">Essay Discourse Marker</option>
              </select>
            </div>
            <div className="form-group">
              <label>Number of Cards</label>
              <select
                value={aiCount}
                onChange={e => setAiCount(Number(e.target.value))}
              >
                <option value={4}>4 Cards</option>
                <option value={6}>6 Cards</option>
                <option value={8}>8 Cards</option>
              </select>
            </div>
            <button
              type="submit"
              className="btn-primary-submit"
              disabled={isGenerating}
            >
              <Plus size={16} />
              <span>
                {isGenerating ? 'Generating with Gemini...' : 'Generate & Add to Deck'}
              </span>
            </button>
          </div>
        </form>
      )}

      {/* FSRS-5 Active Flashcard Study View */}
      {subTab === 'review' && (
        <div className="fsrs-study-container">
          {currentCard ? (
            <div className="flashcard-stage">
              <div
                className={`flashcard-3d ${isFlipped ? 'flipped' : ''}`}
                onClick={() => setIsFlipped(f => !f)}
                role="button"
                tabIndex={0}
              >
                <div className="flashcard-top-bar">
                  <span className="pte-section-pill section-reading">
                    {currentCard.category}
                  </span>
                  <span className="pte-difficulty-pill">{currentCard.topic}</span>
                  <button
                    type="button"
                    className="btn-aussie-audio-mini"
                    onClick={e => {
                      e.stopPropagation()
                      speakAustralianEnglish(
                        `${currentCard.word}. ${currentCard.exampleSentence || ''}`
                      )
                    }}
                  >
                    <Volume2 size={16} /> Pronounce (en-AU)
                  </button>
                </div>

                <h2 className="flashcard-word">{currentCard.word}</h2>
                <p className="flashcard-phonetic">{currentCard.phoneticAu}</p>

                {!isFlipped ? (
                  <p className="flashcard-tap-prompt">
                    Click card to reveal meaning, Australian context & collocations
                  </p>
                ) : (
                  <div className="flashcard-back-details">
                    <div className="fc-detail-row">
                      <strong>Definition:</strong>
                      <p>{currentCard.meaningEn}</p>
                    </div>
                    {currentCard.australianContext && (
                      <div className="fc-detail-row">
                        <strong>Australian & PTE Context:</strong>
                        <p>{currentCard.australianContext}</p>
                      </div>
                    )}
                    {currentCard.exampleSentence && (
                      <div className="fc-detail-row">
                        <strong>Example Sentence:</strong>
                        <p className="fc-example">“{currentCard.exampleSentence}”</p>
                      </div>
                    )}
                    {Array.isArray(currentCard.collocations) &&
                      currentCard.collocations.length > 0 && (
                        <div className="fc-chips-row">
                          {currentCard.collocations.map(col => (
                            <span key={col} className="word-bank-chip">
                              {col}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>
                )}
              </div>

              {/* FSRS-5 Rating Buttons */}
              {isFlipped && schedulingPreview && (
                <div className="fsrs-rating-buttons">
                  <button
                    type="button"
                    className="fsrs-btn fsrs-again"
                    onClick={() => handleGradeCard(Rating.Again)}
                  >
                    <strong>Again</strong>
                    <small>{schedulingPreview[Rating.Again].label}</small>
                  </button>
                  <button
                    type="button"
                    className="fsrs-btn fsrs-hard"
                    onClick={() => handleGradeCard(Rating.Hard)}
                  >
                    <strong>Hard</strong>
                    <small>{schedulingPreview[Rating.Hard].label}</small>
                  </button>
                  <button
                    type="button"
                    className="fsrs-btn fsrs-good"
                    onClick={() => handleGradeCard(Rating.Good)}
                  >
                    <strong>Good</strong>
                    <small>{schedulingPreview[Rating.Good].label}</small>
                  </button>
                  <button
                    type="button"
                    className="fsrs-btn fsrs-easy"
                    onClick={() => handleGradeCard(Rating.Easy)}
                  >
                    <strong>Easy</strong>
                    <small>{schedulingPreview[Rating.Easy].label}</small>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state-box">
              <h3>All Due Flashcards Reviewed! 🎉</h3>
              <p>
                You have reviewed all due cards in this category. Ask Gemini AI to generate new cards by topic or reset the review queue to practice again.
              </p>
              <div className="hero-actions" style={{ justifyContent: 'center', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="btn-ai-generate"
                  onClick={() => setSubTab('ai-add')}
                >
                  <Sparkles size={16} /> Ask AI to Add Words by Topic
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleResetDueDates}
                >
                  <RotateCcw size={16} /> Practice Deck Again Now
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Deck Browser View */}
      {subTab === 'browse' && (
        <div className="vocab-deck-grid">
          {filteredCards.map(card => (
            <div key={card.id} className="vocab-browse-card">
              <div className="yt-vocab-top">
                <div>
                  <h4>{card.word}</h4>
                  <span className="phonetic-span">{card.phoneticAu}</span>
                </div>
                <button
                  type="button"
                  className="btn-aussie-audio-mini"
                  onClick={() => speakAustralianEnglish(card.word)}
                >
                  <Volume2 size={15} />
                </button>
              </div>
              <p className="yt-vocab-meaning">{card.meaningEn}</p>
              <p className="yt-vocab-context">{card.exampleSentence}</p>
              <div className="card-fsrs-meta">
                <span>Reps: {card.fsrs?.reps || 0}</span>
                <span>Stability: {card.fsrs?.stability || 0}d</span>
                <span>{card.category}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
