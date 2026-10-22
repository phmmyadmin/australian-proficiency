import React, { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Target,
  ClipboardCheck,
  Video,
  BookOpen,
  Settings,
  Sparkles,
} from 'lucide-react'
import { INITIAL_PTE_QUESTIONS, APEUNI_MOCK_45C_ATTEMPTS } from './data/pteQuestionBank'
import { INITIAL_AUSSIE_VIDEOS } from './data/aussieYoutubeBank'
import { DEFAULT_VOCAB_DECK } from './data/defaultVocabDeck'
import {
  fetchCustomPteItems,
  saveCustomPteItem,
  fetchPteAttempts,
  savePteAttempt,
  fetchMockSessions,
  saveMockSession,
  fetchCustomYoutubeVideos,
  saveCustomYoutubeVideo,
  loadVocabCardsFromStorage,
  syncVocabCardsToCloud,
} from './lib/supabaseClient'
import { getUserSettings } from './utils/aiConfigStore'
import DashboardView from './views/DashboardView'
import PracticeView from './views/PracticeView'
import MockTestsView from './views/MockTestsView'
import AussieListeningView from './views/AussieListeningView'
import VocabularyView from './views/VocabularyView'
import SettingsModal from './components/SettingsModal'

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [settings, setSettings] = useState(getUserSettings())
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const [questions, setQuestions] = useState(INITIAL_PTE_QUESTIONS)
  const [attempts, setAttempts] = useState(APEUNI_MOCK_45C_ATTEMPTS)
  const [mockSessions, setMockSessions] = useState([])
  const [youtubeVideos, setYoutubeVideos] = useState(INITIAL_AUSSIE_VIDEOS)
  const [vocabCards, setVocabCards] = useState(DEFAULT_VOCAB_DECK)

  useEffect(() => {
    let mounted = true
    async function hydrateFromCloud() {
      const [customItems, savedAttempts, savedMocks, customVideos, savedVocab] =
        await Promise.all([
          fetchCustomPteItems(),
          fetchPteAttempts(),
          fetchMockSessions(),
          fetchCustomYoutubeVideos(),
          loadVocabCardsFromStorage(DEFAULT_VOCAB_DECK),
        ])
      if (!mounted) return

      if (customItems.length > 0) {
        const existingIds = new Set(INITIAL_PTE_QUESTIONS.map(q => q.id))
        const uniqueCustom = customItems.filter(c => !existingIds.has(c.id))
        setQuestions([...uniqueCustom, ...INITIAL_PTE_QUESTIONS])
      }
      if (savedAttempts.length > 0) {
        const savedIds = new Set(savedAttempts.map(a => a.id))
        const extraMock45c = APEUNI_MOCK_45C_ATTEMPTS.filter(a => !savedIds.has(a.id))
        setAttempts([...savedAttempts, ...extraMock45c])
      }
      if (savedMocks.length > 0) setMockSessions(savedMocks)
      if (customVideos.length > 0) {
        const baseIds = new Set(INITIAL_AUSSIE_VIDEOS.map(v => v.id))
        const extra = customVideos.filter(v => !baseIds.has(v.id))
        setYoutubeVideos([...extra, ...INITIAL_AUSSIE_VIDEOS])
      }
      if (savedVocab.length > 0) setVocabCards(savedVocab)
    }
    hydrateFromCloud()
    return () => {
      mounted = false
    }
  }, [])

  const handleAddCustomQuestion = async newItem => {
    await saveCustomPteItem(newItem)
    setQuestions(prev => [newItem, ...prev.filter(q => q.id !== newItem.id)])
  }

  const handleRecordAttempt = async attemptData => {
    const saved = await savePteAttempt(attemptData)
    setAttempts(prev => [saved, ...prev])
  }

  const handleSaveMockSession = async sessionData => {
    const saved = await saveMockSession(sessionData)
    setMockSessions(prev => [saved, ...prev.filter(s => s.id !== saved.id)])
  }

  const handleAddCustomVideo = async videoData => {
    const saved = await saveCustomYoutubeVideo(videoData)
    setYoutubeVideos(prev => [saved, ...prev.filter(v => v.id !== saved.id)])
  }

  const handleUpdateVocabDeck = async updatedDeck => {
    setVocabCards(updatedDeck)
    await syncVocabCardsToCloud(updatedDeck)
  }

  const handleSaveSingleVocabCard = async newCard => {
    const exists = vocabCards.some(
      c => c.word.toLowerCase() === newCard.word.toLowerCase()
    )
    if (exists) return
    const updated = [newCard, ...vocabCards]
    setVocabCards(updated)
    await syncVocabCardsToCloud(updated)
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'practice', label: 'PTE Practice', icon: Target },
    { id: 'mock-tests', label: 'Mock Exams', icon: ClipboardCheck },
    { id: 'aussie-lab', label: 'Aussie YouTube Lab', icon: Video },
    { id: 'vocabulary', label: 'AI Vocab & Flashcards', icon: BookOpen },
  ]

  return (
    <div className="app-shell">
      {/* Top Navigation Bar */}
      <header className="top-navbar">
        <div className="brand-identity" onClick={() => setActiveTab('dashboard')}>
          <div className="brand-logo-mark">AU</div>
          <div>
            <h1 className="brand-title">Australian Proficiency</h1>
            <span className="brand-subtitle">
              PTE Academic 79+ Engine • Aussie Accent Lab • FSRS-5 AI Vocab
            </span>
          </div>
        </div>

        <nav className="main-nav-links" aria-label="Main Navigation">
          {navItems.map(item => {
            const IconComponent = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <IconComponent size={17} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="navbar-right-actions">
          <span className="target-badge-pill">
            <Sparkles size={14} /> Goal: {settings.targetScore}+ PTE
          </span>
          <button
            type="button"
            className="icon-btn"
            aria-label="Open Settings"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings size={19} />
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="main-content-area">
        {activeTab === 'dashboard' && (
          <DashboardView
            attempts={attempts}
            mockSessions={mockSessions}
            vocabCards={vocabCards}
            targetScore={settings.targetScore}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'practice' && (
          <PracticeView
            questions={questions}
            attempts={attempts}
            onAddCustomQuestion={handleAddCustomQuestion}
            onRecordAttempt={handleRecordAttempt}
          />
        )}

        {activeTab === 'mock-tests' && (
          <MockTestsView
            questions={questions}
            mockSessions={mockSessions}
            onSaveMockSession={handleSaveMockSession}
            onRecordAttempt={handleRecordAttempt}
          />
        )}

        {activeTab === 'aussie-lab' && (
          <AussieListeningView
            videos={youtubeVideos}
            attempts={attempts}
            onRecordAttempt={handleRecordAttempt}
            onAddCustomVideo={handleAddCustomVideo}
            onSaveVocabCard={handleSaveSingleVocabCard}
          />
        )}

        {activeTab === 'vocabulary' && (
          <VocabularyView
            vocabCards={vocabCards}
            onUpdateDeck={handleUpdateVocabDeck}
          />
        )}
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsUpdated={updated => setSettings(updated)}
      />
    </div>
  )
}
