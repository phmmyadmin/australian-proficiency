const SETTINGS_KEY = 'aus_prof_user_settings_v1'
const DEFAULT_ENV_KEY = import.meta.env.VITE_GEMINI_API_KEY || ''

const DEFAULT_SETTINGS = {
  targetScore: 79, // 79+ = Superior English (20 PR Points in Australia)
  geminiApiKey: DEFAULT_ENV_KEY,
  useNeuralTts: true,
  geminiVoice: 'Kore', // Kore, Puck, Aoede, Charon
  preferredVoiceURI: '',
  speechRate: 1.0,
  examDate: '',
}

export function getUserSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      geminiApiKey: parsed.geminiApiKey || DEFAULT_ENV_KEY,
    }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveUserSettings(partial) {
  const current = getUserSettings()
  const updated = { ...current, ...partial }
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
  } catch {
    // Ignore storage error
  }
  return updated
}

export function getActiveGeminiKey() {
  const settings = getUserSettings()
  return (settings.geminiApiKey || DEFAULT_ENV_KEY || '').trim()
}
