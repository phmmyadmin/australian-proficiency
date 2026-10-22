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
    let list = questions.filter(q => {
      if (selectedSection !== 'all' && q.section !== selectedSection) return false
      if (selectedTaskType !== 'ALL' && q.taskType !== selectedTaskType) return false
      if (selectedSource === 'mock44b' && q.mockExamBadge !== 'Mock 44B' && q.source !== 'mock_44b') return false
      if (selectedSource === 'mock45c' && q.mockExamBadge !== 'Mock 45C' && q.source !== 'apeuni_mock_45c') return false
      if (selectedSource === 'mock_a' && q.mockExamBadge !== 'Mock Test A' && q.source !== 'apeuni_mock_a') return false
      if (selectedSource === 'wfd_sprint' && q.taskType !== 'WFD') return false
      if (selectedSource === 'rs_ladder' && q.taskType !== 'RS') return false
      if (selectedSource === 'swt_gate' && q.taskType !== 'SWT') return false
      if (selectedSource === 'apeuni_bank' && !String(q.source || '').startsWith('apeuni')) return false
      if (qLower) {
        const titleMatch = String(q.title || '').toLowerCase().includes(qLower)
        const idMatch = String(q.id || '').toLowerCase().includes(qLower)
        if (!titleMatch && !idMatch) return false
      }
      return true
    })

    if (selectedSource === 'rs_ladder') {
      list = [...list].sort((a, b) => {
        const lenA = (a.audioScript || a.promptText || '').split(/\s+/).filter(Boolean).length
        const lenB = (b.audioScript || b.promptText || '').split(/\s+/).filter(Boolean).length
        return lenA - lenB
      })
    }

    return list
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
            className={`task-type-chip ${selectedSource === 'mock44b' ? 'active' : ''}`}
            onClick={() => {
              setSelectedSource('mock44b')
              setVisibleLimit(80)
            }}
          >
            ⚡ Mock Test 44B (65)
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
            className={`task-type-chip ${selectedSource === 'mock_a' ? 'active' : ''}`}
            onClick={() => {
              setSelectedSource('mock_a')
              setVisibleLimit(80)
            }}
          >
            🎯 Mock Test A (65)
          </button>
          <button
            type="button"
            className={`task-type-chip ${selectedSource === 'wfd_sprint' ? 'active' : ''}`}
            style={{ background: selectedSource === 'wfd_sprint' ? '#0F766E' : '#CCFBF1', color: selectedSource === 'wfd_sprint' ? '#FFFFFF' : '#0F766E', borderColor: '#14B8A6' }}
            onClick={() => {
              setSelectedSource('wfd_sprint')
              setSelectedSection('all')
              setSelectedTaskType('ALL')
              setVisibleLimit(80)
            }}
          >
            🎯 WFD Spelling Sprint
          </button>
          <button
            type="button"
            className={`task-type-chip ${selectedSource === 'rs_ladder' ? 'active' : ''}`}
            style={{ background: selectedSource === 'rs_ladder' ? '#15803D' : '#DCFCE7', color: selectedSource === 'rs_ladder' ? '#FFFFFF' : '#15803D', borderColor: '#22C55E' }}
            onClick={() => {
              setSelectedSource('rs_ladder')
              setSelectedSection('all')
              setSelectedTaskType('ALL')
              setVisibleLimit(80)
            }}
          >
            🗣️ RS Fluency Ladder
          </button>
          <button
            type="button"
            className={`task-type-chip ${selectedSource === 'swt_gate' ? 'active' : ''}`}
            style={{ background: selectedSource === 'swt_gate' ? '#B45309' : '#FEF3C7', color: selectedSource === 'swt_gate' ? '#FFFFFF' : '#B45309', borderColor: '#F59E0B' }}
            onClick={() => {
              setSelectedSource('swt_gate')
              setSelectedSection('all')
              setSelectedTaskType('ALL')
              setVisibleLimit(80)
            }}
          >
            ✍️ SWT Single-Sentence Gate
          </button>
          <button
            type="button"
            className={`task-type-chip ${selectedSource === 'apeuni_bank' ? 'active' : ''}`}
            onClick={() => {
              setSelectedSource('apeuni_bank')
              setVisibleLimit(80)
            }}
          >
            📚 Full Bank ({questions.length})
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
                    {q.source === 'apeuni_mock_a' && (
                      <span className="q-ai-badge" style={{ background: '#E0E7FF', color: '#3730A3' }}>
                        Mock A
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
          {selectedSource === 'wfd_sprint' && (
            <div style={{
              background: '#F0FDFA',
              border: '1px solid #99F6E4',
              borderRadius: '8px',
              padding: '0.9rem 1.1rem',
              marginBottom: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                <strong style={{ color: '#0F766E', fontSize: '0.95rem' }}>
                  🎯 WFD Spelling & Plural Sprint (23% de Writing • 13% de Listening)
                </strong>
                <span style={{ fontSize: '0.8rem', background: '#CCFBF1', color: '#115E59', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                  Meta: 90%+ Exactitud (+1.0 pt/palabra a Writing)
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#134E4A', lineHeight: 1.45 }}>
                En Write From Dictation cada palabra exacta suma <strong>+1.0 pt a Writing</strong> y <strong>+0.6 pt a Listening</strong>. En tu Mock 44B perdiste 7 palabras (-8.5 pts en Writing). Presta máxima atención a:
              </p>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.82rem', color: '#115E59', lineHeight: 1.4 }}>
                <li><strong>Plurales críticos (-s / -es)</strong>: <code>meeting</code> vs <code>meetings</code>, <code>strategy</code> vs <code>strategies</code>, <code>knife</code> vs <code>knives</code>.</li>
                <li><strong>Voz pasiva con terminación -ed</strong>: tras <code>was / were</code> siempre va participio (ej. <code>was imposed</code>, el audio enlaza <em>impose-din</em>).</li>
                <li><strong>Dobles consonantes académicas</strong>: <code>accommodate</code>, <code>occurrence</code>, <code>committee</code>, <code>millennium</code>, <code>embarrass</code>.</li>
              </ul>
            </div>
          )}

          {selectedSource === 'rs_ladder' && (
            <div style={{
              background: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: '8px',
              padding: '0.9rem 1.1rem',
              marginBottom: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                <strong style={{ color: '#166534', fontSize: '0.95rem' }}>
                  🗣️ RS Fluency Ladder (16% de Speaking • 17% de Listening)
                </strong>
                <span style={{ fontSize: '0.8rem', background: '#DCFCE7', color: '#14532D', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>
                  Regla de Oro: Fluidez 5/5 Salva el 70% de la Nota
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#14532D', lineHeight: 1.45 }}>
                <strong>Si olvidas una palabra a mitad de frase, ¡NUNCA TE DETENGAS A PENSAR!</strong> En Pearson Score Guide, mantener la fluidez continua sin pausas (&gt;0.6s) garantiza <strong>5/5 en Oral Fluency</strong>. Cuando dudaste en el Mock 45C (#1233, #1351), la nota cayó a 16–17/90; cuando hablaste continuo, sacaste 61–71/90.
              </p>
              <span style={{ fontSize: '0.8rem', color: '#15803D', fontWeight: 600 }}>
                🪜 Escalera progresiva activa: Las frases están ordenadas de menor a mayor longitud (de 6 a 14 palabras).
              </span>
            </div>
          )}

          {selectedSource === 'swt_gate' && (
            <div style={{
              background: '#FEF3C7',
              border: '1px solid #FCD34D',
              borderRadius: '8px',
              padding: '0.9rem 1.1rem',
              marginBottom: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
                <strong style={{ color: '#92400E', fontSize: '0.95rem' }}>
                  ✍️ SWT Single-Sentence Master Gate (28% de Writing • 23% de Reading)
                </strong>
                <span style={{ fontSize: '0.8rem', background: '#FDE68A', color: '#78350F', padding: '0.15rem 0.5rem', borderRadius: '4px', fontWeight: 700 }}>
                  Compuerta Binaria: 1 Frase = Puntos • 2 Frases = 0/9 Total
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.84rem', color: '#78350F', lineHeight: 1.45 }}>
                En Summarize Written Text tu resumen <strong>DEBE ser exactamente UNA SOLA ORACIÓN</strong> (5 a 75 palabras con un único punto final <code>.</code>). En el Mock 45C pusiste <code>. In conclusion,</code> en ambos resúmenes y sacaste <strong>0/9</strong> (-20 pts en Writing y -13 en Reading).
              </p>
              <div style={{ fontSize: '0.82rem', color: '#92400E', background: '#FFFBEB', padding: '0.4rem 0.6rem', borderRadius: '4px', border: '1px solid #FDE68A' }}>
                💡 <strong>Plantilla Segura</strong>: <code>&quot;[Idea principal del texto], even though [segunda idea], so [conclusión final].&quot;</code> (Usa comas y conectores subordinantes: <code>, which</code>, <code>, although</code>, <code>, so</code> en vez de puntos seguidos).
              </div>
            </div>
          )}

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
