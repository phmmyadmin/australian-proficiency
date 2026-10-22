import React, { useState, useMemo } from 'react'
import { Sparkles, Filter, PlusCircle, CheckCircle2 } from 'lucide-react'
import { PTE_TASK_META } from '../scoring/pteScoringEngine'
import { generatePteQuestionWithAI } from '../utils/geminiClient'
import PteTaskRunner from '../components/PteTaskRunner'

const SECTIONS = [
  { id: 'all', label: 'All Sections (20 Types)' },
  { id: 'speaking', label: 'Speaking (7 Types)' },
  { id: 'writing', label: 'Writing (2 Types)' },
  { id: 'reading', label: 'Reading (5 Types)' },
  { id: 'listening', label: 'Listening (8 Types)' },
]

export default function PracticeView({
  questions = [],
  attempts = [],
  onAddCustomQuestion,
  onRecordAttempt,
}) {
  const [selectedSection, setSelectedSection] = useState('all')
  const [selectedTaskType, setSelectedTaskType] = useState('ALL')
  const [selectedSource, setSelectedSource] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleLimit, setVisibleLimit] = useState(80)
  const [activeItemId, setActiveItemId] = useState(questions[0]?.id || 'ra_01')

  const [showAiGenerator, setShowAiGenerator] = useState(false)
  const [aiTaskType, setAiTaskType] = useState('RA')
  const [aiTopic, setAiTopic] = useState('Australian Renewable Energy & Urban Ecology')
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiError, setAiError] = useState('')

  // Group attempts by itemId for quick lookup in sidebar and active runner
  const attemptsByItem = useMemo(() => {
    const map = new Map()
    attempts.forEach(att => {
      if (!att.itemId) return
      const list = map.get(att.itemId) || []
      list.push(att)
      map.set(att.itemId, list)
    })
    return map
  }, [attempts])

  const availableTaskTypes = useMemo(() => {
    const entries = Object.values(PTE_TASK_META)
    if (selectedSection === 'all') return entries
    return entries.filter(t => t.section === selectedSection)
  }, [selectedSection])

  const filteredQuestions = useMemo(() => {
    const qLower = searchQuery.trim().toLowerCase()
    return questions.filter(q => {
      if (selectedSection !== 'all' && q.section !== selectedSection) return false
      if (selectedTaskType !== 'ALL' && q.taskType !== selectedTaskType) return false
      if (selectedSource === 'mock45c' && q.source !== 'apeuni_mock_45c') return false
      if (selectedSource === 'apeuni_bank' && !String(q.source || '').startsWith('apeuni')) return false
      if (qLower) {
        const titleMatch = String(q.title || '').toLowerCase().includes(qLower)
        const idMatch = String(q.id || '').toLowerCase().includes(qLower)
        if (!titleMatch && !idMatch) return false
      }
      return true
    })
  }, [questions, selectedSection, selectedTaskType, selectedSource, searchQuery])

  const visibleQuestions = useMemo(() => {
    return filteredQuestions.slice(0, visibleLimit)
  }, [filteredQuestions, visibleLimit])

  const activeItem = useMemo(() => {
    return (
      filteredQuestions.find(q => q.id === activeItemId) ||
      filteredQuestions[0] ||
      questions[0]
    )
  }, [filteredQuestions, activeItemId, questions])

  const activeItemAttempts = useMemo(() => {
    if (!activeItem) return []
    return attemptsByItem.get(activeItem.id) || []
  }, [activeItem, attemptsByItem])

  const handleGenerateAiItem = async e => {
    e.preventDefault()
    setIsGenerating(true)
    setAiError('')
    try {
      const newItem = await generatePteQuestionWithAI(aiTaskType, aiTopic)
      if (onAddCustomQuestion) {
        await onAddCustomQuestion(newItem)
      }
      setSelectedSection('all')
      setSelectedTaskType(aiTaskType)
      setActiveItemId(newItem.id)
      setShowAiGenerator(false)
    } catch (err) {
      setAiError(err.message || 'Could not generate question with Gemini AI.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="practice-view">
      {/* Filter & AI Generator Bar */}
      <div className="practice-controls-bar">
        <div className="section-tabs-row">
          {SECTIONS.map(sec => (
            <button
              key={sec.id}
              type="button"
              className={`sec-filter-btn ${selectedSection === sec.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedSection(sec.id)
                setSelectedTaskType('ALL')
                setVisibleLimit(80)
              }}
            >
              {sec.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            className={`task-type-chip ${selectedSource === 'all' ? 'active' : ''}`}
            onClick={() => {
              setSelectedSource('all')
              setVisibleLimit(80)
            }}
          >
            All Sources ({questions.length})
          </button>
          <button
            type="button"
            className={`task-type-chip ${selectedSource === 'mock45c' ? 'active' : ''}`}
            onClick={() => {
              setSelectedSource('mock45c')
              setVisibleLimit(80)
            }}
          >
            🔥 Mock Test 45C (65)
          </button>
          <button
            type="button"
            className={`task-type-chip ${selectedSource === 'apeuni_bank' ? 'active' : ''}`}
            onClick={() => {
              setSelectedSource('apeuni_bank')
              setVisibleLimit(80)
            }}
          >
            📚 Full APEUni Bank (1,056)
          </button>
          <button
            type="button"
            className="btn-ai-generate"
            onClick={() => setShowAiGenerator(v => !v)}
          >
            <Sparkles size={16} />
            <span>Generate New PTE Question with AI</span>
          </button>
        </div>
      </div>

      {/* Task Type Pills */}
      <div className="task-type-pills-scroll">
        <button
          type="button"
          className={`task-type-chip ${selectedTaskType === 'ALL' ? 'active' : ''}`}
          onClick={() => {
            setSelectedTaskType('ALL')
            setVisibleLimit(80)
          }}
        >
          <Filter size={13} /> All ({filteredQuestions.length})
        </button>
        {availableTaskTypes.map(meta => (
          <button
            key={meta.code}
            type="button"
            className={`task-type-chip ${selectedTaskType === meta.code ? 'active' : ''}`}
            onClick={() => {
              setSelectedTaskType(meta.code)
              setVisibleLimit(80)
            }}
          >
            <strong>{meta.code}</strong> — {meta.name}
          </button>
        ))}
      </div>

      {/* Collapsible AI Question Generator Panel */}
      {showAiGenerator && (
        <form className="ai-generator-drawer" onSubmit={handleGenerateAiItem}>
          <h4>
            <PlusCircle size={17} /> Generate Official-Spec PTE Question via Gemini AI
          </h4>
          <div className="ai-gen-fields">
            <div className="form-group">
              <label>Task Type</label>
              <select
                value={aiTaskType}
                onChange={e => setAiTaskType(e.target.value)}
              >
                {Object.values(PTE_TASK_META).map(m => (
                  <option key={m.code} value={m.code}>
                    [{m.code}] {m.name} ({m.section.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group flex-grow">
              <label>Academic or Australian Topic Focus</label>
              <input
                type="text"
                value={aiTopic}
                onChange={e => setAiTopic(e.target.value)}
                placeholder="e.g., CSIRO Quantum Computing, Sydney Metro, Coral Bleaching..."
              />
            </div>
            <button
              type="submit"
              className="btn-primary-submit"
              disabled={isGenerating}
            >
              <Sparkles size={16} />
              <span>{isGenerating ? 'Creating Question...' : 'Create & Save to Bank'}</span>
            </button>
          </div>
          {aiError && <p className="error-banner">{aiError}</p>}
        </form>
      )}

      {/* Main Split Layout: Question Selector Sidebar + Active Task Runner */}
      <div className="practice-workspace-grid">
        <aside className="question-selector-sidebar">
          <div className="sidebar-header" style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            <span>Questions ({filteredQuestions.length})</span>
            <input
              type="search"
              placeholder="Search #num or title..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                setVisibleLimit(80)
              }}
              style={{
                width: '100%',
                padding: '0.38rem 0.6rem',
                fontSize: '0.82rem',
                borderRadius: '6px',
                border: '1px solid #D6D3CD',
                background: '#FFFFFF',
              }}
            />
          </div>
          <div className="question-list-scroll">
            {visibleQuestions.map(q => {
              const qAttempts = attemptsByItem.get(q.id) || []
              const bestScore =
                qAttempts.length > 0
                  ? Math.max(
                      ...qAttempts.map(
                        a => a.scores?.pteScaleEquivalent || a.scores?.percentage || 0
                      )
                    )
                  : null
              return (
                <button
                  key={q.id}
                  type="button"
                  className={`question-list-item ${activeItem?.id === q.id ? 'active' : ''}`}
                  onClick={() => setActiveItemId(q.id)}
                >
                  <div className="q-item-top">
                    <span className="q-code-badge">{q.taskType}</span>
                    <span className="q-diff-badge">{q.difficulty || 'C1'}</span>
                    {q.source === 'apeuni_mock_45c' && (
                      <span className="q-ai-badge" style={{ background: '#FEF3C7', color: '#B45309' }}>
                        45C
                      </span>
                    )}
                    {q.source === 'ai_generated' && (
                      <span className="q-ai-badge">AI</span>
                    )}
                    {qAttempts.length > 0 && (
                      <span className="q-history-badge" title="Completed attempts & best score">
                        <CheckCircle2 size={11} /> {qAttempts.length}x • Best {bestScore}/90
                      </span>
                    )}
                  </div>
                  <span className="q-item-title">{q.title}</span>
                </button>
              )
            })}
            {filteredQuestions.length > visibleLimit && (
              <button
                type="button"
                className="btn-secondary-small"
                style={{ width: '100%', marginTop: '0.5rem', justifyContent: 'center' }}
                onClick={() => setVisibleLimit(prev => prev + 100)}
              >
                Show More ({filteredQuestions.length - visibleLimit} remaining)
              </button>
            )}
          </div>
        </aside>

        <section className="active-runner-pane">
          {activeItem ? (
            <PteTaskRunner
              item={activeItem}
              itemAttempts={activeItemAttempts}
              onCompleteAttempt={onRecordAttempt}
            />
          ) : (
            <div className="empty-state-box">
              No questions match this filter. Click &ldquo;Generate New PTE Question with AI&rdquo; to create one!
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
