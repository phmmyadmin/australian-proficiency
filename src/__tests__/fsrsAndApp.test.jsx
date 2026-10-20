import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { initCard, nextState, Rating, State, isDue, getSchedulingPreview } from '../utils/fsrsEngine'
import App from '../App'

describe('FSRS-5 Spaced Repetition & Australian Proficiency App Integration', () => {
  it('transitions FSRS-5 flashcards from New -> Learning -> Review with increasing stability', () => {
    const now = Date.now()
    const card0 = initCard(now)
    expect(card0.state).toBe(State.New)
    expect(isDue(card0, now)).toBe(true)

    const card1 = nextState(card0, Rating.Good, now)
    expect(card1.state).toBe(State.Learning)
    expect(card1.stability).toBeGreaterThan(2)

    const card2 = nextState(card1, Rating.Easy, now + 15 * 60 * 1000)
    expect(card2.state).toBe(State.Review)
    expect(card2.scheduledDays).toBeGreaterThanOrEqual(1)

    const preview = getSchedulingPreview(card2, now + 15 * 60 * 1000)
    expect(preview[Rating.Good].label).toBeTruthy()
  })

  it('renders Australian Proficiency navigation and switches across all 5 core modules', () => {
    render(<App />)

    expect(screen.getByText('Australian Proficiency')).toBeInTheDocument()
    expect(screen.getByText(/Communicative Skills Profile/i)).toBeInTheDocument()

    // Switch to PTE Practice
    fireEvent.click(screen.getByRole('button', { name: /PTE Practice/i }))
    expect(screen.getByText(/Generate New PTE Question with AI/i)).toBeInTheDocument()

    // Switch to Mock Exams
    fireEvent.click(screen.getByRole('button', { name: /Mock Exams/i }))
    expect(screen.getByText(/PTE Academic Timed Mock Tests/i)).toBeInTheDocument()

    // Switch to Aussie YouTube Lab
    fireEvent.click(screen.getByRole('button', { name: /Aussie YouTube Lab/i }))
    expect(screen.getByText(/Australian Accent YouTube Listening Lab/i)).toBeInTheDocument()

    // Switch to AI Vocab & Flashcards
    fireEvent.click(screen.getByRole('button', { name: /AI Vocab & Flashcards/i }))
    expect(screen.getByText(/FSRS-5 Vocabulary & Aussie Flashcards/i)).toBeInTheDocument()
  })
})
