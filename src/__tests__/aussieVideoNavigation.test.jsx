import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import AussieListeningView from '../views/AussieListeningView'
import { INITIAL_AUSSIE_VIDEOS } from '../data/aussieYoutubeBank'

describe('Aussie Video Activities: Catalog & Dedicated Page Architecture', () => {
  it('renders the video activity catalog by default with cards and formatted seconds', () => {
    render(
      <AussieListeningView
        videos={INITIAL_AUSSIE_VIDEOS}
        attempts={[]}
        onRecordAttempt={vi.fn()}
      />
    )

    // Verify Catalog Header
    expect(
      screen.getByText(/Australian Accent YouTube Listening Lab/i)
    ).toBeInTheDocument()

    // Verify Video Activity Cards exist in catalog
    expect(
      screen.getByText(/Morning Milking 230 Cows Through Our New Dairy/i)
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Farms Are Selling Like Crazy! Is It Time/i)
    ).toBeInTheDocument()

    // Verify formatted seconds preview in cards (e.g. 13:29–13:55)
    expect(screen.getAllByText(/13:29–13:55/i).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Entrar a la Actividad/i).length).toBeGreaterThan(0)
  })

  it('navigates from catalog to dedicated activity page on click with timeline seconds controls', () => {
    render(
      <AussieListeningView
        videos={INITIAL_AUSSIE_VIDEOS}
        attempts={[]}
        onRecordAttempt={vi.fn()}
      />
    )

    // Click on the first video activity card
    const cardTitle = screen.getByText(
      /Morning Milking 230 Cows Through Our New Dairy/i
    )
    fireEvent.click(cardTitle)

    // Now in Dedicated Activity Page!
    // 1. Verify Back to Catalog buttons (top nav and bottom nav)
    const backBtns = screen.getAllByText(/Volver al Catálogo de Actividades/i)
    expect(backBtns.length).toBeGreaterThanOrEqual(1)

    // 2. Verify Next / Previous activity navigation controls
    expect(screen.getByRole('button', { name: /^Siguiente$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^Anterior$/i })).toBeInTheDocument()

    // 3. Verify Timeline of Seconds ("desde allí salgan los segundos")
    expect(
      screen.getByText(/Timeline de Segundos de Escucha/i)
    ).toBeInTheDocument()
    expect(screen.getByText(/13:29 → 13:55/i)).toBeInTheDocument()
    expect(screen.getByText(/⏱️ 26s de audio/i)).toBeInTheDocument()

    // 4. Verify Workstation Tabs
    expect(screen.getByText(/1\. Dictado del Segmento/i)).toBeInTheDocument()
    expect(screen.getByText(/2\. Shadowing y Articulación/i)).toBeInTheDocument()
    expect(screen.getByText(/3\. Quiz de Comprensión/i)).toBeInTheDocument()
    expect(screen.getByText(/4\. Vocabulario Australiano/i)).toBeInTheDocument()

    // 5. Click Next Activity button to navigate to the next video activity
    const nextBtn = screen.getByRole('button', { name: /^Siguiente$/i })
    fireEvent.click(nextBtn)

    // Video changes without one-page cramming!
    expect(
      screen.getAllByText(/Volver al Catálogo de Actividades/i).length
    ).toBeGreaterThanOrEqual(1)

    // 6. Click Back to Catalog
    fireEvent.click(backBtns[0])

    // Returns cleanly to the Catalog View
    expect(screen.getAllByText(/Entrar a la Actividad/i).length).toBeGreaterThan(0)
  })
})
