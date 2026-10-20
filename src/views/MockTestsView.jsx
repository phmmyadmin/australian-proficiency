import React, { useState, useMemo } from 'react'
import {
  ClipboardCheck,
  Play,
  Award,
  Clock,
  CheckCircle2,
  RotateCcw,
  Layers,
} from 'lucide-react'
import { MOCK_TEST_BLUEPRINTS } from '../data/pteQuestionBank'
import { aggregatePteScoreReport } from '../scoring/pteScoringEngine'
import PteTaskRunner from '../components/PteTaskRunner'

export default function MockTestsView({
  questions = [],
  mockSessions = [],
  onSaveMockSession,
  onRecordAttempt,
}) {
  const [activeBlueprint, setActiveBlueprint] = useState(null)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [sessionAttempts, setSessionAttempts] = useState([])
  const [completedReport, setCompletedReport] = useState(null)

  const examItems = useMemo(() => {
    if (!activeBlueprint) return []
    const map = new Map(questions.map(q => [q.id, q]))
    return activeBlueprint.itemIds.map(id => map.get(id)).filter(Boolean)
  }, [activeBlueprint, questions])

  const handleStartExam = blueprint => {
    setActiveBlueprint(blueprint)
    setCurrentIdx(0)
    setSessionAttempts([])
    setCompletedReport(null)
  }

  const handleNextExamItem = async (scoredResult, userResponse) => {
    const currentItem = examItems[currentIdx]
    const attemptEntry = {
      itemId: currentItem.id,
      taskType: currentItem.taskType,
      section: currentItem.section,
      title: currentItem.title,
      userResponse,
      scores: scoredResult,
    }

    const updatedAttempts = [...sessionAttempts, attemptEntry]
    setSessionAttempts(updatedAttempts)

    if (currentIdx + 1 < examItems.length) {
      setCurrentIdx(currentIdx + 1)
    } else {
      const aggregated = aggregatePteScoreReport(updatedAttempts)
      const sessionObj = {
        id: `mock_${Date.now()}`,
        blueprintId: activeBlueprint.id,
        title: activeBlueprint.title,
        mode: activeBlueprint.mode,
        status: 'completed',
        overallScore: aggregated.overallScore,
        communicativeScores: aggregated.communicativeScores,
        enablingScores: aggregated.enablingScores,
        itemResults: updatedAttempts,
        completedAt: new Date().toISOString(),
      }
      setCompletedReport({ ...aggregated, blueprint: activeBlueprint, itemResults: updatedAttempts })
      if (onSaveMockSession) {
        await onSaveMockSession(sessionObj)
      }
    }
  }

  // Render Official PTE Score Report Card after completion
  if (completedReport) {
    return (
      <div className="mock-report-card-view">
        <div className="official-report-header">
          <div>
            <span className="report-badge">OFFICIAL SIMULATION SCORE REPORT</span>
            <h2>{completedReport.blueprint.title}</h2>
            <p>{completedReport.australianVisaBand.label}</p>
          </div>
          <div className="overall-circle-large">
            <span className="overall-num">{completedReport.overallScore}</span>
            <small>Overall (10–90)</small>
          </div>
        </div>

        <div className="comm-skills-grid">
          {Object.entries(completedReport.communicativeScores).map(([skill, val]) => (
            <div key={skill} className="comm-skill-card">
              <div className="comm-skill-top">
                <span className="comm-skill-name">{skill.toUpperCase()}</span>
                <span className="comm-skill-val">{val} / 90</span>
              </div>
              <div className="comm-progress-track">
                <div
                  className="comm-progress-fill"
                  style={{ width: `${Math.round(((val - 10) / 80) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="section-block">
          <h3>Item-by-Item Exam Breakdown</h3>
          <div className="recent-attempts-list">
            {completedReport.itemResults.map((res, idx) => (
              <div key={idx} className="recent-attempt-row">
                <span className="pte-code-pill">{res.taskType}</span>
                <span className="recent-attempt-name">{res.title}</span>
                <span className="recent-attempt-score">
                  {res.scores.rawPoints}/{res.scores.maxPoints} ({res.scores.percentage}%)
                </span>
                <span className="recent-attempt-eq">{res.scores.pteScaleEquivalent}/90 Eq.</span>
              </div>
            ))}
          </div>
        </div>

        <div className="report-actions">
          <button
            type="button"
            className="btn-primary-submit"
            onClick={() => {
              setActiveBlueprint(null)
              setCompletedReport(null)
            }}
          >
            <RotateCcw size={16} /> Back to Mock Exam Center
          </button>
        </div>
      </div>
    )
  }

  // Active Exam Runner
  if (activeBlueprint && examItems[currentIdx]) {
    const currentItem = examItems[currentIdx]
    const progressPct = Math.round(((currentIdx + 1) / examItems.length) * 100)

    return (
      <div className="active-mock-exam">
        <div className="mock-progress-header">
          <div>
            <strong>{activeBlueprint.title}</strong>
            <span className="mock-step-counter">
              Question {currentIdx + 1} of {examItems.length}
            </span>
          </div>
          <button
            type="button"
            className="btn-secondary-small"
            onClick={() => setActiveBlueprint(null)}
          >
            Exit Mock Exam
          </button>
        </div>
        <div className="mock-progress-bar-track">
          <div className="mock-progress-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>

        <PteTaskRunner
          item={currentItem}
          examMode={true}
          onCompleteAttempt={onRecordAttempt}
          onNextExamItem={handleNextExamItem}
        />
      </div>
    )
  }

  // Mock Exam Catalog + History
  return (
    <div className="mock-tests-catalog">
      <div className="section-block-header">
        <div>
          <h2>
            <ClipboardCheck size={22} /> PTE Academic Timed Mock Tests
          </h2>
          <p className="subtle-caption">
            Simulated Pearson VUE testing environment with full cross-module 10–90 score report cards.
          </p>
        </div>
      </div>

      <div className="mock-blueprints-grid">
        {MOCK_TEST_BLUEPRINTS.map(bp => (
          <div key={bp.id} className="mock-blueprint-card">
            <div className="bp-top-meta">
              <span className={`bp-mode-badge mode-${bp.mode}`}>
                {bp.mode.toUpperCase()}
              </span>
              <span className="bp-duration">
                <Clock size={14} /> {bp.durationMinutes} mins • {bp.itemIds.length} tasks
              </span>
            </div>
            <h3>{bp.title}</h3>
            <p>{bp.description}</p>
            <button
              type="button"
              className="btn-primary-submit"
              onClick={() => handleStartExam(bp)}
            >
              <Play size={16} /> Start Timed Mock Exam
            </button>
          </div>
        ))}
      </div>

      {mockSessions.length > 0 && (
        <div className="section-block">
          <h3>
            <Award size={18} /> Completed Mock Exam Reports
          </h3>
          <div className="recent-attempts-list">
            {mockSessions.map(sess => (
              <div key={sess.id} className="recent-attempt-row">
                <span className="pte-code-pill">MOCK</span>
                <span className="recent-attempt-name">{sess.title}</span>
                <span className="recent-attempt-score">
                  S:{sess.communicativeScores?.speaking ?? '-'} W:{sess.communicativeScores?.writing ?? '-'} R:{sess.communicativeScores?.reading ?? '-'} L:{sess.communicativeScores?.listening ?? '-'}
                </span>
                <span className="recent-attempt-eq">
                  Overall: {sess.overallScore}/90
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
