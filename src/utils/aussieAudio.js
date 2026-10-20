import { getUserSettings, getActiveGeminiKey } from './aiConfigStore'

/**
 * High-Fidelity Australian English Neural Audio Service
 * Primary: Gemini 2.5 Flash Neural TTS (`gemini-2.5-flash-preview-tts`) with IndexedDB WAV caching
 * Fallback: Enhanced Browser SpeechSynthesis (`en-AU`)
 */

const CACHE_DB_NAME = 'aus_prof_neural_tts_v1'
const CACHE_STORE_NAME = 'audio_blobs'
const memoryAudioCache = new Map()
let activeAudioElement = null

function openAudioDb() {
  return new Promise(resolve => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null)
      return
    }
    try {
      const request = window.indexedDB.open(CACHE_DB_NAME, 1)
      request.onupgradeneeded = e => {
        const db = e.target.result
        if (!db.objectStoreNames.contains(CACHE_STORE_NAME)) {
          db.createObjectStore(CACHE_STORE_NAME)
        }
      }
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

async function getCachedAudio(cacheKey) {
  if (memoryAudioCache.has(cacheKey)) {
    return memoryAudioCache.get(cacheKey)
  }
  const db = await openAudioDb()
  if (!db) return null

  return new Promise(resolve => {
    try {
      const tx = db.transaction(CACHE_STORE_NAME, 'readonly')
      const store = tx.objectStore(CACHE_STORE_NAME)
      const req = store.get(cacheKey)
      req.onsuccess = () => {
        if (req.result) {
          memoryAudioCache.set(cacheKey, req.result)
          resolve(req.result)
        } else {
          resolve(null)
        }
      }
      req.onerror = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
}

async function saveCachedAudio(cacheKey, base64Audio, mimeType = 'audio/wav') {
  const entry = { base64Audio, mimeType, timestamp: Date.now() }
  memoryAudioCache.set(cacheKey, entry)
  const db = await openAudioDb()
  if (!db) return
  try {
    const tx = db.transaction(CACHE_STORE_NAME, 'readwrite')
    tx.objectStore(CACHE_STORE_NAME).put(entry, cacheKey)
  } catch {
    // Ignore storage quota issues
  }
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

export function pcm16ToWav(pcmData, sampleRate = 24000, numChannels = 1) {
  const byteLength = pcmData.byteLength
  const buffer = new ArrayBuffer(44 + byteLength)
  const view = new DataView(buffer)

  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + byteLength, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * numChannels * 2, true)
  view.setUint16(32, numChannels * 2, true)
  view.setUint16(34, 16, true)
  writeString(view, 36, 'data')
  view.setUint32(40, byteLength, true)

  new Uint8Array(buffer, 44).set(new Uint8Array(pcmData))
  return buffer
}

export async function synthesizeGeminiAustralianAudio(text, voiceName = 'Kore') {
  const cleanText = String(text || '').trim()
  if (!cleanText) return null

  const cacheKey = `${voiceName}::${cleanText.toLowerCase()}`
  const cached = await getCachedAudio(cacheKey)
  if (cached && cached.base64Audio) {
    return `data:${cached.mimeType || 'audio/wav'};base64,${cached.base64Audio}`
  }

  const apiKey = getActiveGeminiKey()
  if (!apiKey || typeof fetch === 'undefined') return null

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${encodeURIComponent(
    apiKey
  )}`

  const payload = {
    contents: [
      {
        parts: [
          {
            text: `Read the following sentence aloud in a natural, clear, human Australian English accent suitable for a university lecture or PTE Academic exam:\n\n"${cleanText}"`,
          },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: voiceName || 'Kore',
          },
        },
      },
    },
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Gemini TTS status ${response.status}`)
  }

  const data = await response.json()
  const parts = data?.candidates?.[0]?.content?.parts || []
  const audioPart = parts.find(p => p.inlineData && p.inlineData.data)
  if (!audioPart) {
    throw new Error('No audio inlineData returned from Gemini TTS')
  }

  const mimeType = audioPart.inlineData.mimeType || 'audio/wav'
  let base64Audio = audioPart.inlineData.data

  if (mimeType.includes('pcm') || mimeType.includes('raw') || mimeType.includes('L16')) {
    const binaryString = atob(base64Audio)
    const len = binaryString.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    const wavBuffer = pcm16ToWav(bytes.buffer, 24000, 1)
    const wavBytes = new Uint8Array(wavBuffer)
    let binaryWav = ''
    for (let i = 0; i < wavBytes.length; i++) {
      binaryWav += String.fromCharCode(wavBytes[i])
    }
    base64Audio = btoa(binaryWav)
  }

  await saveCachedAudio(cacheKey, base64Audio, 'audio/wav')
  return `data:audio/wav;base64,${base64Audio}`
}

export function getAvailableEnglishVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return []
  const voices = window.speechSynthesis.getVoices() || []
  const enVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('en'))
  return enVoices.sort((a, b) => {
    const scoreVoice = v => {
      let s = 0
      const lang = (v.lang || '').toLowerCase()
      const name = (v.name || '').toLowerCase()
      if (lang.includes('au')) s += 20
      if (/natural|neural|enhanced|premium|google|siri/i.test(name)) s += 15
      if (/karen|catherine|gordon|lee|daniel/i.test(name)) s += 10
      return s
    }
    return scoreVoice(b) - scoreVoice(a)
  })
}

export function stopSpeaking() {
  if (activeAudioElement) {
    try {
      activeAudioElement.pause()
      activeAudioElement.currentTime = 0
    } catch {
      // Ignore pause errors
    }
    activeAudioElement = null
  }
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}

function speakFallbackBrowserTTS(text, options = {}) {
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
    const match = voices.find(
      v => v.voiceURI === settings.preferredVoiceURI || v.name === settings.preferredVoiceURI
    )
    if (match) utterance.voice = match
  } else if (voices.length > 0) {
    utterance.voice = voices[0]
  }

  if (options.onStart) utterance.onstart = options.onStart
  if (options.onEnd) utterance.onend = options.onEnd
  if (options.onError) utterance.onerror = options.onError

  window.speechSynthesis.speak(utterance)
}

/**
 * Speaks Australian English using Gemini Neural TTS (`gemini-2.5-flash-preview-tts`)
 * with automatic IndexedDB caching and instant fallback to browser TTS in tests/offline.
 */
export async function speakAustralianEnglish(text, options = {}) {
  const cleanText = String(text || '').trim()
  if (!cleanText) {
    if (options.onEnd) options.onEnd()
    return
  }

  stopSpeaking()
  const settings = getUserSettings()
  const playbackRate = options.rate || settings.speechRate || 1.0

  // In Vitest/jsdom or when Neural TTS is disabled, use fallback immediately
  const isTestEnv = typeof process !== 'undefined' && process.env?.NODE_ENV === 'test'
  if (settings.useNeuralTts !== false && !isTestEnv && typeof Audio !== 'undefined') {
    try {
      if (options.onLoading) options.onLoading(true)
      const audioUri = await synthesizeGeminiAustralianAudio(
        cleanText,
        options.voiceName || settings.geminiVoice || 'Kore'
      )
      if (options.onLoading) options.onLoading(false)
      if (audioUri) {
        const audio = new Audio(audioUri)
        audio.playbackRate = playbackRate
        activeAudioElement = audio
        audio.onplay = () => {
          if (options.onStart) options.onStart()
        }
        audio.onended = () => {
          activeAudioElement = null
          if (options.onEnd) options.onEnd()
        }
        audio.onerror = () => {
          activeAudioElement = null
          speakFallbackBrowserTTS(cleanText, options)
        }
        await audio.play()
        return
      }
    } catch {
      if (options.onLoading) options.onLoading(false)
    }
  }

  speakFallbackBrowserTTS(cleanText, options)
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

    if (!SpeechRecognition) {
      if (onError) {
        onError(
          'Web Speech API is not supported in this browser. You can type or paste your spoken transcript directly.'
        )
      }
      return false
    }

    try {
      recognition = new SpeechRecognition()
      recognition.lang = 'en-AU'
      recognition.continuous = true
      recognition.interimResults = true
      recognition.maxAlternatives = 3

      recognition.onresult = event => {
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

      recognition.onerror = e => {
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
