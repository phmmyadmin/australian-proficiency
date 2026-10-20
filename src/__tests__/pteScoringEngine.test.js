import { describe, it, expect } from 'vitest'
import {
  alignWordSequences,
  scoreMCMA,
  scoreReorderParagraphs,
  scoreHighlightIncorrectWords,
  scoreSummarizeWrittenText,
  scoreWriteEssay,
  scoreSummarizeSpokenText,
  evaluatePteTask,
  aggregatePteScoreReport,
} from '../scoring/pteScoringEngine'

describe('Reverse-Engineered PTE Academic Scoring Engine', () => {
  it('aligns word sequences using word-level Levenshtein DP for WFD / RA / RS', () => {
    const ref = 'All statistical claims in your dissertation must be supported by empirical evidence.'
    const cand = 'All statistical claims in dissertation must be supported by empirical evidence'
    const res = alignWordSequences(ref, cand, false)

    expect(res.totalRefWords).toBe(12)
    expect(res.matchedCount).toBe(11)
    expect(res.omittedCount).toBe(1)
    expect(res.diff.some(d => d.word === 'your' && d.status === 'missing')).toBe(true)
  })

  it('enforces +1/-1 with minimum floor 0 on Multiple Choice Multiple Answer (MCMA)', () => {
    const correct = ['A', 'C', 'D']
    const partial = scoreMCMA(correct, ['A', 'C', 'B'])
    // 2 correct (+2), 1 wrong (-1) => net 1 / 3
    expect(partial.rawPoints).toBe(1)
    expect(partial.maxPoints).toBe(3)

    // Floor at 0 when wrong selections exceed correct selections
    const floored = scoreMCMA(correct, ['B', 'E'])
    expect(floored.rawPoints).toBe(0)
  })

  it('scores Re-order Paragraphs (ROP) by counting exact adjacent pairs', () => {
    const correctOrder = ['p1', 'p2', 'p3', 'p4']
    // User puts p1->p2 (correct pair), p2->p4 (wrong), p4->p3 (wrong)
    const partial = scoreReorderParagraphs(correctOrder, ['p1', 'p2', 'p4', 'p3'])
    expect(partial.rawPoints).toBe(1)
    expect(partial.maxPoints).toBe(3)

    const perfect = scoreReorderParagraphs(correctOrder, ['p1', 'p2', 'p3', 'p4'])
    expect(perfect.rawPoints).toBe(3)
    expect(perfect.percentage).toBe(100)
  })

  it('scores Highlight Incorrect Words (HIW) with +1/-1 and floor 0', () => {
    const targetIndices = [20, 28, 35, 40]
    const res = scoreHighlightIncorrectWords(targetIndices, [20, 28, 35, 10])
    // 3 hits (+3), 1 false alarm (-1) => 2/4
    expect(res.rawPoints).toBe(2)
    expect(res.maxPoints).toBe(4)

    const floorRes = scoreHighlightIncorrectWords(targetIndices, [1, 2, 3])
    expect(floorRes.rawPoints).toBe(0)
  })

  it('enforces the strict single-sentence 5-75 word Form gate on Summarize Written Text (SWT)', () => {
    const mockItem = {
      taskType: 'SWT',
      promptText: 'Urban sponge cities absorb stormwater in aquifers and cool street temperatures.',
      keywords: ['sponge cities', 'stormwater', 'aquifers', 'temperatures'],
    }

    // Two sentences => Form = 0 and Total = 0
    const twoSentences =
      'Urban sponge cities absorb stormwater in underground aquifers. This also lowers summer temperatures.'
    const failSent = scoreSummarizeWrittenText(mockItem, twoSentences)
    expect(failSent.rawPoints).toBe(0)
    expect(failSent.subscores.form.score).toBe(0)

    // Too short (<5 words) => Form = 0 and Total = 0
    const tooShort = scoreSummarizeWrittenText(mockItem, 'Sponge cities work.')
    expect(tooShort.rawPoints).toBe(0)

    // Valid single sentence between 5 and 75 words
    const validSummary =
      'By replacing impermeable concrete with porous pavements and wetlands, urban sponge cities harvest stormwater into underground aquifers while significantly lowering summer street temperatures.'
    const passRes = scoreSummarizeWrittenText(mockItem, validSummary)
    expect(passRes.subscores.form.score).toBe(1)
    expect(passRes.rawPoints).toBeGreaterThan(4)
  })

  it('enforces word count gates on Write Essay (WE) and Summarize Spoken Text (SST)', () => {
    const weItem = { taskType: 'WE', keywords: ['productivity', 'automation'] }
    // Under 120 words => Form = 0, Total = 0
    const shortEssay = scoreWriteEssay(weItem, 'This essay is far too short to pass the PTE form gate.')
    expect(shortEssay.rawPoints).toBe(0)

    // 210 words => Form = 2
    const twoHundredWords = Array(210).fill('productivity').join(' ') + '.'
    const fullFormEssay = scoreWriteEssay(weItem, twoHundredWords)
    expect(fullFormEssay.subscores.form.score).toBe(2)
    expect(fullFormEssay.rawPoints).toBeGreaterThan(8)

    // SST 55 words => Form = 2
    const sstItem = { taskType: 'SST', keywords: ['lithium', 'recycling'] }
    const fiftyFiveWords = Array(55).fill('lithium').join(' ') + '.'
    const sstRes = scoreSummarizeSpokenText(sstItem, fiftyFiveWords)
    expect(sstRes.subscores.form.score).toBe(2)
  })

  it('computes cross-module Communicative & Enabling Skills on the 10-90 PTE scale', () => {
    const wfdItem = {
      id: 'wfd_01',
      taskType: 'WFD',
      section: 'listening',
      audioScript: 'All statistical claims in your dissertation must be supported by empirical evidence.',
    }
    const evaluated = evaluatePteTask(wfdItem, {
      textAnswer: 'All statistical claims in your dissertation must be supported by empirical evidence.',
    })

    expect(evaluated.percentage).toBe(100)
    expect(evaluated.pteScaleEquivalent).toBe(90)
    expect(evaluated.communicativeContribution.listening).toBe(45)
    expect(evaluated.communicativeContribution.writing).toBe(45)

    const report = aggregatePteScoreReport([{ taskType: 'WFD', scores: evaluated }])
    expect(report.communicativeScores.listening).toBe(90)
    expect(report.communicativeScores.writing).toBe(90)
  })

  it('detects exact inter-word extra pauses (pauseLocations & pauseBeforeSec) and penalizes Oral Fluency', () => {
    const rsItem = {
      id: 'rs_01',
      taskType: 'RS',
      section: 'speaking',
      audioScript: 'Postgraduate students must submit their ethics approval forms before commencing any fieldwork.',
    }

    // Smooth response with zero pauses
    const smooth = evaluatePteTask(rsItem, {
      transcript: 'Postgraduate students must submit their ethics approval forms before commencing any fieldwork.',
      wordTimings: [],
    })
    expect(smooth.subscores.oralFluency.score).toBeGreaterThanOrEqual(4.5)
    expect(smooth.pauseLocations.length).toBe(0)

    // Response with 2 extra pauses (1 long 1.45s pause before "submit", 1 short 0.85s pause before "forms")
    const hesitant = evaluatePteTask(rsItem, {
      transcript: 'Postgraduate students must    submit their ethics approval  forms before commencing any fieldwork.',
      wordTimings: [
        { word: 'Postgraduate', pauseBeforeSec: 0 },
        { word: 'students', pauseBeforeSec: 0.25 },
        { word: 'must', pauseBeforeSec: 0.28 },
        { word: 'submit', pauseBeforeSec: 1.45 },
        { word: 'their', pauseBeforeSec: 0.3 },
        { word: 'ethics', pauseBeforeSec: 0.28 },
        { word: 'approval', pauseBeforeSec: 0.3 },
        { word: 'forms', pauseBeforeSec: 0.85 },
        { word: 'before', pauseBeforeSec: 0.28 },
        { word: 'commencing', pauseBeforeSec: 0.3 },
        { word: 'any', pauseBeforeSec: 0.25 },
        { word: 'fieldwork', pauseBeforeSec: 0.28 },
      ],
    })

    expect(hesitant.pauseLocations.length).toBe(2)
    expect(hesitant.pauseLocations[0]).toMatchObject({
      afterWord: 'must',
      beforeWord: 'submit',
      severity: 'long',
    })
    expect(hesitant.subscores.oralFluency.score).toBeLessThan(smooth.subscores.oralFluency.score)
    const submitToken = hesitant.diff.find(t => t.word === 'submit')
    expect(submitToken.pauseBeforeSec).toBe(1.45)
  })
})
