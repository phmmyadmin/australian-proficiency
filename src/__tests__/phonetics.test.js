import { describe, it, expect } from 'vitest'
import {
  generateApproximateIPA,
  scoreSingleWordPronunciation,
  ACADEMIC_IPA_DICT,
} from '../utils/phonetics'

describe('Word Phonetics & Single-Word Pronunciation Scorer', () => {
  it('retrieves accurate IPA transcriptions for PTE academic words', () => {
    expect(generateApproximateIPA('academic')).toBe(ACADEMIC_IPA_DICT.academic)
    expect(generateApproximateIPA('resilience')).toBe(ACADEMIC_IPA_DICT.resilience)
    expect(generateApproximateIPA('empirical')).toBe(ACADEMIC_IPA_DICT.empirical)
  })

  it('generates plausible rule-based IPA for non-dictionary words', () => {
    const ipa = generateApproximateIPA('reforestation')
    expect(ipa).toContain('ʃən')
    expect(ipa.startsWith('/')).toBe(true)
    expect(ipa.endsWith('/')).toBe(true)
  })

  it('evaluates exact word pronunciation with 100% score and 5 stars', () => {
    const res = scoreSingleWordPronunciation('dissertation', 'dissertation')
    expect(res.score).toBe(100)
    expect(res.pteStarRating).toBe(5)
    expect(res.isMatch).toBe(true)
  })

  it('penalizes mispronounced or substituted words and provides targeted feedback', () => {
    const near = scoreSingleWordPronunciation('resilience', 'resilence')
    expect(near.score).toBeGreaterThanOrEqual(80)
    expect(near.pteStarRating).toBeGreaterThanOrEqual(4)

    const wrong = scoreSingleWordPronunciation('infrastructure', 'inflation')
    expect(wrong.score).toBeLessThan(60)
    expect(wrong.pteStarRating).toBeLessThanOrEqual(2)
    expect(wrong.feedback).toContain('Se detectó')
  })
})
