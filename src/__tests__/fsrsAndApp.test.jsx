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

  it('saves and displays per-activity response and score history when an exercise is evaluated', async () => {
    render(<App />)

    // Navigate to PTE Practice
    fireEvent.click(screen.getByRole('button', { name: /PTE Practice/i }))
    expect(screen.getByText(/Activity History — Saved Responses & Scores/i)).toBeInTheDocument()

    // Enter a spoken transcript in Read Aloud and evaluate
    const textarea = screen.getByPlaceholderText(
      /Speak into your microphone or type\/paste your spoken response here/i
    )
    fireEvent.change(textarea, {
      target: {
        value:
          'Researchers at the University of Melbourne have discovered that urban green corridors significantly reduce summertime surface temperatures.',
      },
    })

    fireEvent.click(screen.getByRole('button', { name: /Evaluate Response & Show Score Breakdown/i }))

    // Verify the attempt and saved response appear in the Activity History section
    expect(await screen.findByText(/Attempt #1/i)).toBeInTheDocument()
    expect(screen.getByText(/Saved Response:/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Inspect \/ Load Attempt/i })).toBeInTheDocument()
  })
})

