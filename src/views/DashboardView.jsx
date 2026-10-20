import React from 'react'
import {
  Award,
  Flame,
  TrendingUp,
  PlayCircle,
  Video,
  BookOpen,
  ClipboardCheck,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { aggregatePteScoreReport, PTE_TASK_META } from '../scoring/pteScoringEngine'
import { isDue } from '../utils/fsrsEngine'

export default function DashboardView({
  attempts = [],
  mockSessions = [],
  vocabCards = [],
  targetScore = 79,
  onNavigateTab,
}) {
  const report = aggregatePteScoreReport(attempts)
  const dueCardsCount = vocabCards.filter(c => isDue(c.fsrs)).length

  const skills = [
    { key: 'speaking', label: 'Speaking', score: report.communicativeScores.speaking, color: '#10b981' },
    { key: 'writing', label: 'Writing', score: report.communicativeScores.writing, color: '#f59e0b' },
    { key: 'reading', label: 'Reading', score: report.communicativeScores.reading, color: '#3b82f6' },
    { key: 'listening', label: 'Listening', score: report.communicativeScores.listening, color: '#8b5cf6' },
  ]

  const enablingList = [
    { key: 'oralFluency', label: 'Oral Fluency', score: report.enablingScores.oralFluency },
    { key: 'pronunciation', label: 'Pronunciation', score: report.enablingScores.pronunciation },
    { key: 'grammar', label: 'Grammar', score: report.enablingScores.grammar },
    { key: 'vocabulary', label: 'Vocabulary', score: report.enablingScores.vocabulary },
    { key: 'spelling', label: 'Spelling', score: report.enablingScores.spelling },
    { key: 'writtenDiscourse', label: 'Written Discourse', score: report.enablingScores.writtenDiscourse },
  ]

  return (
    <div className="dashboard-view">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-banner-left">
          <div className="aussie-tag">
            <Sparkles size={14} />
            <span>Pearson PTE Academic Reverse-Engineered Engine + Aussie Accent Lab</span>
          </div>
          <h2>G’day! Ready to Hit {targetScore}+ Superior English?</h2>
          <p>
            Practice all 20 PTE task types with exact cross-module partial credit, train your ear on
            authentic Australian YouTube broadcasts, and master C1/C2 vocabulary with FSRS-5 flashcards.
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="btn-gold-cta"
              onClick={() => onNavigateTab('practice')}
            >
              <PlayCircle size={18} /> Practice PTE Tasks
            </button>
            <button
              type="button"
              className="btn-outline-cta"
              onClick={() => onNavigateTab('mock-tests')}
            >
              <ClipboardCheck size={18} /> Start Full Mock Test
            </button>
          </div>
        </div>

        <div className="hero-score-card">
          <span className="overall-label">ESTIMATED OVERALL PTE</span>
          <div className="overall-number-row">
            <span className="overall-big">{report.overallScore}</span>
            <span className="overall-out-of">/ 90</span>
          </div>
          <div
            className="visa-band-pill"
            style={{ borderColor: report.australianVisaBand.color }}
          >
            {report.australianVisaBand.label}
          </div>
          <div className="target-gap-note">
            Target: <strong>{targetScore}+</strong> • Completed Drills:{' '}
            <strong>{attempts.length}</strong> • Mock Exams: <strong>{mockSessions.length}</strong>
          </div>
        </div>
      </div>

      {/* 4 Communicative Skills Gauges */}
      <div className="section-block">
        <div className="section-block-header">
          <h3>
            <Award size={18} /> Communicative Skills Profile (10–90 Scale)
          </h3>
          <span className="subtle-caption">
            Calculated via Pearson cross-skill weighting matrix
          </span>
        </div>
        <div className="comm-skills-grid">
          {skills.map(s => {
            const pct = Math.round(((s.score - 10) / 80) * 100)
            const meetsTarget = s.score >= targetScore
            return (
              <div key={s.key} className="comm-skill-card">
                <div className="comm-skill-top">
                  <span className="comm-skill-name">{s.label}</span>
                  <span className="comm-skill-val" style={{ color: s.color }}>
                    {s.score} <small>/ 90</small>
                  </span>
                </div>
                <div className="comm-progress-track">
                  <div
                    className="comm-progress-fill"
                    style={{ width: `${pct}%`, backgroundColor: s.color }}
                  />
                </div>
                <div className="comm-skill-foot">
                  {meetsTarget ? (
                    <span className="target-met">
                      <CheckCircle2 size={13} /> Above {targetScore} Target
                    </span>
                  ) : (
                    <span>+{targetScore - s.score} pts needed for target</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Action Modules + Enabling Skills */}
      <div className="dashboard-two-col">
        <div className="section-block">
          <div className="section-block-header">
            <h3>
              <TrendingUp size={18} /> Enabling Skills Breakdown
            </h3>
          </div>
          <div className="enabling-bars-list">
            {enablingList.map(en => (
              <div key={en.key} className="enabling-bar-row">
                <span className="enabling-label">{en.label}</span>
                <div className="enabling-track">
                  <div
                    className="enabling-fill"
                    style={{ width: `${Math.round(((en.score - 10) / 80) * 100)}%` }}
                  />
                </div>
                <strong className="enabling-val">{en.score}/90</strong>
              </div>
            ))}
          </div>
        </div>

        <div className="section-block">
          <div className="section-block-header">
            <h3>
              <Flame size={18} /> High-Impact Study Modules
            </h3>
          </div>
          <div className="quick-launch-stack">
            <div
              className="quick-launch-card"
              onClick={() => onNavigateTab('aussie-lab')}
              role="button"
              tabIndex={0}
            >
              <div className="ql-icon ql-youtube">
                <Video size={22} />
              </div>
              <div className="ql-info">
                <h4>Australian Accent YouTube Listening Lab</h4>
                <p>
                  Dictation segments, non-rhotic vowel linking notes, shadowing & comprehension quizzes.
                </p>
              </div>
            </div>

            <div
              className="quick-launch-card"
              onClick={() => onNavigateTab('vocabulary')}
              role="button"
              tabIndex={0}
            >
              <div className="ql-icon ql-vocab">
                <BookOpen size={22} />
              </div>
              <div className="ql-info">
                <h4>
                  FSRS-5 Vocabulary & Aussie Slang ({dueCardsCount} Cards Due)
                </h4>
                <p>
                  Spaced repetition flashcards + Ask Gemini AI to generate cards for any topic.
                </p>
              </div>
            </div>

            <div
              className="quick-launch-card"
              onClick={() => onNavigateTab('mock-tests')}
              role="button"
              tabIndex={0}
            >
              <div className="ql-icon ql-mock">
                <ClipboardCheck size={22} />
              </div>
              <div className="ql-info">
                <h4>79+ Big-4 Booster Mock (RA, RS, RWFIB, WFD)</h4>
                <p>
                  Focus on the 4 tasks that contribute over 60% of cross-module PTE points.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Attempts Table */}
      {attempts.length > 0 && (
        <div className="section-block">
          <div className="section-block-header">
            <h3>Recent Practice Activity</h3>
          </div>
          <div className="recent-attempts-list">
            {attempts.slice(0, 6).map(att => {
              const meta = PTE_TASK_META[att.taskType] || { name: att.taskType, code: att.taskType }
              return (
                <div key={att.id} className="recent-attempt-row">
                  <span className="pte-code-pill">{meta.code}</span>
                  <span className="recent-attempt-name">{meta.name}</span>
                  <span className="recent-attempt-score">
                    {att.scores?.rawPoints ?? 0}/{att.scores?.maxPoints ?? 10} (
                    {att.scores?.percentage ?? 0}%)
                  </span>
                  <span className="recent-attempt-eq">
                    {att.scores?.pteScaleEquivalent ?? 65}/90 Eq.
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
