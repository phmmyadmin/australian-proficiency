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
    return questions.filter(q => {
      if (selectedSection !== 'all' && q.section !== selectedSection) return false
      if (selectedTaskType !== 'ALL' && q.taskType !== selectedTaskType) return false
      return true
    })
  }, [questions, selectedSection, selectedTaskType])

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
              }}
            >
              {sec.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="btn-ai-generate"
          onClick={() => setShowAiGenerator(v => !v)}
        >
          <Sparkles size={16} />
          <span>Generate New PTE Question with AI</span>
        </button>
      </div>

      {/* Task Type Pills */}
      <div className="task-type-pills-scroll">
        <button
          type="button"
          className={`task-type-chip ${selectedTaskType === 'ALL' ? 'active' : ''}`}
          onClick={() => setSelectedTaskType('ALL')}
        >
          <Filter size={13} /> All ({filteredQuestions.length})
        </button>
        {availableTaskTypes.map(meta => (
          <button
            key={meta.code}
            type="button"
            className={`task-type-chip ${selectedTaskType === meta.code ? 'active' : ''}`}
            onClick={() => setSelectedTaskType(meta.code)}
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
          <div className="sidebar-header">
            <span>Questions ({filteredQuestions.length})</span>
          </div>
          <div className="question-list-scroll">
            {filteredQuestions.map(q => {
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
