import { getUserSettings } from './aiConfigStore'

/**
 * Australian English (en-AU) Text-to-Speech & Speech Recognition Helper
 */
export function getAvailableEnglishVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return []
  const voices = window.speechSynthesis.getVoices() || []
  const enVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('en'))
  // Sort Australian voices first (Karen, Catherine, Gordon, Lee, en-AU)
  return enVoices.sort((a, b) => {
    const aAu = a.lang.toLowerCase().includes('au') || /karen|catherine|gordon|lee|australian/i.test(a.name)
    const bAu = b.lang.toLowerCase().includes('au') || /karen|catherine|gordon|lee|australian/i.test(b.name)
    if (aAu && !bAu) return -1
    if (!aAu && bAu) return 1
    return a.name.localeCompare(b.name)
  })
}

export function speakAustralianEnglish(text, options = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis || !text) {
    if (options.onEnd) options.onEnd()
    return
  }
  window.speechSynthesis.cancel()
  const settings = getUserSettings()
  const utterance = new window.SpeechSynthesisUtterance(text)
  utterance.lang = 'en-AU'
  utterance.rate = options.rate || settings.speechRate || 1.0
  utterance.pitch = options.pitch || 1.0

  const voices = getAvailableEnglishVoices()
  if (settings.preferredVoiceURI) {
    const match = voices.find(v => v.voiceURI === settings.preferredVoiceURI || v.name === settings.preferredVoiceURI)
    if (match) utterance.voice = match
  } else if (voices.length > 0) {
    utterance.voice = voices[0]
  }

  if (options.onStart) utterance.onstart = options.onStart
  if (options.onEnd) utterance.onend = options.onEnd
  if (options.onError) utterance.onerror = options.onError

  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}

/**
 * Creates a live Web Speech API recognizer configured for Australian English (en-AU)
 * that also tracks inter-phrase pauses and hesitation markers for PTE Oral Fluency scoring.
 */
export function createSpeechCaptureSession({ onInterimTranscript, onFinalUpdate, onError }) {
  const SpeechRecognition =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)

  let recognition = null
  let isRecording = false
  let startTime = 0
  let lastResultTimestamp = 0
  let pauseCount = 0
  let longPauseCount = 0
  let finalTranscript = ''
  let interimTranscript = ''

  const start = () => {
    startTime = Date.now()
    lastResultTimestamp = startTime
    pauseCount = 0
    longPauseCount = 0
    finalTranscript = ''
    interimTranscript = ''
    isRecording = true

    if (!SpeechRecognition) {
      if (onError) {
        onError('Web Speech API is not supported in this browser. You can type or paste your spoken transcript directly.')
      }
      return false
    }

    try {
      recognition = new SpeechRecognition()
      recognition.lang = 'en-AU'
      recognition.continuous = true
      recognition.interimResults = true

      recognition.onresult = (event) => {
        const now = Date.now()
        const gapSec = (now - lastResultTimestamp) / 1000
        if (lastResultTimestamp > startTime) {
          if (gapSec >= 1.2) pauseCount += 1
          if (gapSec >= 2.5) longPauseCount += 1
        }
        lastResultTimestamp = now

        let currentInterim = ''
        let accumulatedFinal = ''
        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i]
          if (res.isFinal) {
            accumulatedFinal += res[0].transcript + ' '
          } else {
            currentInterim += res[0].transcript
          }
        }
        if (accumulatedFinal.trim()) {
          finalTranscript = accumulatedFinal.trim()
        }
        interimTranscript = currentInterim.trim()
        const combined = `${finalTranscript} ${interimTranscript}`.trim()
        if (onInterimTranscript) onInterimTranscript(combined)
        if (onFinalUpdate) {
          onFinalUpdate({
            transcript: combined,
            durationSec: Math.max(1, (now - startTime) / 1000),
            pauseCount,
            longPauseCount,
          })
        }
      }

      recognition.onerror = (e) => {
        if (e.error !== 'no-speech' && e.error !== 'aborted' && onError) {
          onError(`Microphone notice: ${e.error}`)
        }
      }

      recognition.start()
      return true
    } catch (err) {
      if (onError) onError(err.message || 'Could not start speech recognition.')
      return false
    }
  }

  const stop = () => {
    isRecording = false
    const durationSec = startTime ? Math.max(1, (Date.now() - startTime) / 1000) : 1
    if (recognition) {
      try {
        recognition.stop()
      } catch {
        // Ignore stop errors
      }
    }
    const combined = `${finalTranscript} ${interimTranscript}`.trim()
    return {
      transcript: combined,
      durationSec: Math.round(durationSec * 10) / 10,
      pauseCount,
      longPauseCount,
    }
  }

  return { start, stop, isSupported: Boolean(SpeechRecognition) }
}
