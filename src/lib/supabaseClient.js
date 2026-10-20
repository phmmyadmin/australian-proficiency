import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tarkabzvlllptenatxln.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_slCCCjjFmUxs5R1LrLiRPQ_k8Qy7RUP'
const supabaseSchema = import.meta.env.VITE_SUPABASE_SCHEMA || 'australian_proficiency'

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      db: { schema: supabaseSchema }
    })
  : null

const STORAGE_KEYS = {
  CUSTOM_ITEMS: 'aus_prof_custom_items_v1',
  ATTEMPTS: 'aus_prof_attempts_v1',
  MOCK_SESSIONS: 'aus_prof_mock_sessions_v1',
  YOUTUBE_VIDEOS: 'aus_prof_youtube_videos_v2',
  VOCAB_CARDS: 'aus_prof_vocab_cards_v1',
}

function readLocal(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function writeLocal(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch {
    // Ignore storage quota errors in restricted environments
  }
}

export async function fetchCustomPteItems() {
  const local = readLocal(STORAGE_KEYS.CUSTOM_ITEMS, [])
  if (!supabase) return local
  try {
    const { data, error } = await supabase
      .from('pte_items')
      .select('*')
      .order('created_at', { ascending: false })
    if (error || !data) return local
    const normalized = data.map(row => ({
      id: row.id,
      taskType: row.task_type,
      section: row.section,
      title: row.title,
      difficulty: row.difficulty || 'C1',
      promptText: row.prompt_text,
      audioScript: row.audio_script,
      mediaData: row.media_data || {},
      options: row.options || [],
      answerKey: row.answer_key || {},
      metadata: row.metadata || {},
      source: row.source || 'ai_generated',
      ...(row.metadata?.fullItem || {})
    }))
    writeLocal(STORAGE_KEYS.CUSTOM_ITEMS, normalized)
    return normalized
  } catch {
    return local
  }
}

export async function saveCustomPteItem(item) {
  const local = readLocal(STORAGE_KEYS.CUSTOM_ITEMS, [])
  const updated = [item, ...local.filter(x => x.id !== item.id)]
  writeLocal(STORAGE_KEYS.CUSTOM_ITEMS, updated)

  if (supabase) {
    try {
      await supabase.from('pte_items').upsert({
        id: item.id,
        task_type: item.taskType,
        section: item.section,
        title: item.title,
        difficulty: item.difficulty || 'C1',
        prompt_text: item.promptText || item.prompt || '',
        audio_script: item.audioScript || '',
        media_data: item.mediaData || item.chartData || {},
        options: item.options || item.paragraphs || item.blanks || [],
        answer_key: item.answerKey || {},
        metadata: { fullItem: item },
        source: item.source || 'ai_generated',
      })
    } catch {
      // Fallback already persisted locally
    }
  }
  return item
}

export async function fetchPteAttempts() {
  const local = readLocal(STORAGE_KEYS.ATTEMPTS, [])
  if (!supabase) return local
  try {
    const { data, error } = await supabase
      .from('pte_attempts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200)
    if (error || !data) return local
    const mapped = data.map(row => ({
      id: row.id,
      itemId: row.item_id,
      taskType: row.task_type,
      section: row.section,
      userResponse: row.user_response,
      scores: row.scores,
      communicativeContribution: row.communicative_contribution,
      enablingContribution: row.enabling_contribution,
      feedback: row.feedback,
      durationSec: row.duration_sec,
      createdAt: row.created_at,
    }))
    if (mapped.length >= local.length) {
      writeLocal(STORAGE_KEYS.ATTEMPTS, mapped)
      return mapped
    }
    return local
  } catch {
    return local
  }
}

export async function savePteAttempt(attempt) {
  const entry = {
    id: attempt.id || `att_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    createdAt: attempt.createdAt || new Date().toISOString(),
    ...attempt,
  }
  const local = readLocal(STORAGE_KEYS.ATTEMPTS, [])
  writeLocal(STORAGE_KEYS.ATTEMPTS, [entry, ...local].slice(0, 300))

  if (supabase) {
    try {
      await supabase.from('pte_attempts').insert({
        id: entry.id,
        item_id: entry.itemId,
        task_type: entry.taskType,
        section: entry.section,
        user_response: entry.userResponse || {},
        scores: entry.scores || {},
        communicative_contribution: entry.communicativeContribution || {},
        enabling_contribution: entry.enablingContribution || {},
        feedback: entry.feedback || {},
        duration_sec: entry.durationSec || 0,
      })
    } catch {
      // Local copy already saved
    }
  }
  return entry
}

export async function fetchMockSessions() {
  const local = readLocal(STORAGE_KEYS.MOCK_SESSIONS, [])
  if (!supabase) return local
  try {
    const { data, error } = await supabase
      .from('mock_sessions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(50)
    if (error || !data) return local
    const mapped = data.map(row => ({
      id: row.id,
      blueprintId: row.blueprint_id,
      title: row.title,
      mode: row.mode,
      status: row.status,
      overallScore: row.overall_score,
      communicativeScores: row.communicative_scores,
      enablingScores: row.enabling_scores,
      itemResults: row.item_results,
      startedAt: row.started_at,
      completedAt: row.completed_at,
    }))
    if (mapped.length >= local.length) {
      writeLocal(STORAGE_KEYS.MOCK_SESSIONS, mapped)
      return mapped
    }
    return local
  } catch {
    return local
  }
}

export async function saveMockSession(session) {
  const entry = {
    id: session.id || `mock_${Date.now()}`,
    startedAt: session.startedAt || new Date().toISOString(),
    completedAt: session.completedAt || new Date().toISOString(),
    ...session,
  }
  const local = readLocal(STORAGE_KEYS.MOCK_SESSIONS, [])
  const filtered = local.filter(s => s.id !== entry.id)
  writeLocal(STORAGE_KEYS.MOCK_SESSIONS, [entry, ...filtered])

  if (supabase) {
    try {
      await supabase.from('mock_sessions').upsert({
        id: entry.id,
        blueprint_id: entry.blueprintId,
        title: entry.title,
        mode: entry.mode || 'full',
        status: entry.status || 'completed',
        overall_score: entry.overallScore || 10,
        communicative_scores: entry.communicativeScores || {},
        enabling_scores: entry.enablingScores || {},
        item_results: entry.itemResults || [],
        started_at: entry.startedAt,
        completed_at: entry.completedAt,
      })
    } catch {
      // Local copy already saved
    }
  }
  return entry
}

export async function fetchCustomYoutubeVideos() {
  const local = readLocal(STORAGE_KEYS.YOUTUBE_VIDEOS, [])
  if (!supabase) return local
  try {
    const { data, error } = await supabase
      .from('youtube_videos')
      .select('*')
      .order('created_at', { ascending: false })
    if (error || !data) return local
    const mapped = data.map(row => ({
      id: row.id,
      youtubeId: row.youtube_id,
      title: row.title,
      channel: row.channel,
      accentRegion: row.accent_region,
      topic: row.topic,
      difficulty: row.difficulty,
      segments: row.segments || [],
      comprehensionQuestions: row.comprehension_questions || [],
      vocabulary: row.vocabulary || [],
    }))
    if (mapped.length >= local.length) {
      writeLocal(STORAGE_KEYS.YOUTUBE_VIDEOS, mapped)
      return mapped
    }
    return local
  } catch {
    return local
  }
}

export async function saveCustomYoutubeVideo(video) {
  const local = readLocal(STORAGE_KEYS.YOUTUBE_VIDEOS, [])
  const updated = [video, ...local.filter(v => v.id !== video.id)]
  writeLocal(STORAGE_KEYS.YOUTUBE_VIDEOS, updated)

  if (supabase) {
    try {
      await supabase.from('youtube_videos').upsert({
        id: video.id,
        youtube_id: video.youtubeId,
        title: video.title,
        channel: video.channel || 'Australian English Channel',
        accent_region: video.accentRegion || 'General Australian',
        topic: video.topic || 'Australian Culture & Society',
        difficulty: video.difficulty || 'C1',
        segments: video.segments || [],
        comprehension_questions: video.comprehensionQuestions || [],
        vocabulary: video.vocabulary || [],
      })
    } catch {
      // Saved locally
    }
  }
  return video
}

export async function syncVocabCardsToCloud(cards) {
  writeLocal(STORAGE_KEYS.VOCAB_CARDS, cards)
  if (!supabase || !Array.isArray(cards) || cards.length === 0) return
  try {
    const rows = cards.map(c => ({
      id: c.id,
      word: c.word,
      phonetic_au: c.phoneticAu || '',
      category: c.category || 'Academic',
      topic: c.topic || 'General PTE',
      meaning_en: c.meaningEn || '',
      australian_context: c.australianContext || '',
      example_sentence: c.exampleSentence || '',
      synonyms: c.synonyms || [],
      collocations: c.collocations || [],
      fsrs_state: c.fsrs || {},
      updated_at: new Date().toISOString(),
    }))
    await supabase.from('vocab_cards').upsert(rows)
  } catch {
    // Saved locally
  }
}

export async function loadVocabCardsFromStorage(defaultDeck = []) {
  const local = readLocal(STORAGE_KEYS.VOCAB_CARDS, null)
  if (local && Array.isArray(local) && local.length > 0) {
    return local
  }
  if (supabase) {
    try {
      const { data, error } = await supabase.from('vocab_cards').select('*')
      if (!error && data && data.length > 0) {
        const mapped = data.map(row => ({
          id: row.id,
          word: row.word,
          phoneticAu: row.phonetic_au,
          category: row.category,
          topic: row.topic,
          meaningEn: row.meaning_en,
          australianContext: row.australian_context,
          exampleSentence: row.example_sentence,
          synonyms: row.synonyms || [],
          collocations: row.collocations || [],
          fsrs: row.fsrs_state || null,
        }))
        writeLocal(STORAGE_KEYS.VOCAB_CARDS, mapped)
        return mapped
      }
    } catch {
      // Fall back to defaultDeck
    }
  }
  writeLocal(STORAGE_KEYS.VOCAB_CARDS, defaultDeck)
  return defaultDeck
}
