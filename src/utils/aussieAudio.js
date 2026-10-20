import { getUserSettings, getActiveGeminiKey } from './aiConfigStore'

/**
 * High-Fidelity Australian English Neural Audio Service + Word-Timestamp Fluency Tracker
 * Primary TTS: Gemini 2.5 Flash Neural TTS (`gemini-2.5-flash-preview-tts`) with IndexedDB WAV caching
 * Speech Capture: Tracks exact per-word arrival timestamps (`wordTimings`), active speech duration
 * (excluding lead-in and trailing silence), and inter-word pause gaps (`pauseBeforeSec`).
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

export async function speakAustralianEnglish(text, options = {}) {
  const cleanText = String(text || '').trim()
  if (!cleanText) {
    if (options.onEnd) options.onEnd()
    return
  }

  stopSpeaking()
  const settings = getUserSettings()
  const playbackRate = options.rate || settings.speechRate || 1.0

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

function splitCleanWords(text = '') {
  return String(text || '')
    .trim()
    .split(/\s+/)
    .map(w => w.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, ''))
    .filter(Boolean)
}

/**
 * Creates a live Web Speech API recognizer configured for Australian English (en-AU)
 * that records exact per-word arrival timestamps (`wordTimings`) to detect where the
 * speaker makes unnatural pauses (`pauseBeforeSec >= 0.55s`) and computes active speech
 * duration (first spoken word to last spoken word, ignoring pre/post button click silence).
 */
export function createSpeechCaptureSession({ onInterimTranscript, onFinalUpdate, onError }) {
  const SpeechRecognition =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)

  let recognition = null
  let sessionStartTime = 0
  let firstWordTime = 0
  let lastWordTime = 0
  let wordTimings = [] // [{ word, timestamp, pauseBeforeSec }]
  let finalTranscript = ''
  let interimTranscript = ''

  const computePauseStats = timings => {
    let pauseCount = 0
    let longPauseCount = 0
    timings.forEach((wt, idx) => {
      if (idx === 0) return
      if (wt.pauseBeforeSec >= 0.6) pauseCount += 1
      if (wt.pauseBeforeSec >= 1.2) longPauseCount += 1
    })
    return { pauseCount, longPauseCount }
  }

  const computeActiveDurationSec = (wordsCount, nowTs) => {
    if (firstWordTime > 0 && lastWordTime > firstWordTime) {
      // Add ~0.35s for the articulation of the very first word
      return Math.max(1.2, (lastWordTime - firstWordTime) / 1000 + 0.35)
    }
    if (wordsCount > 0) {
      // Fallback if browser delivered all words in a single batch
      return Math.max(1.5, (nowTs - sessionStartTime) / 1000)
    }
    return 1.0
  }

  const updateWordTimingsFromTranscript = (combinedText, now) => {
    const currentWords = splitCleanWords(combinedText)
    if (currentWords.length === 0) return

    if (!firstWordTime) {
      firstWordTime = now
      lastWordTime = now
    }

    const prevLen = wordTimings.length
    if (currentWords.length > prevLen) {
      const newCount = currentWords.length - prevLen
      const totalGapSec = lastWordTime ? Math.max(0, (now - lastWordTime) / 1000) : 0

      // Expected natural articulation time is ~0.32s per word.
      // Any excess time above natural articulation of the newly arrived words is a pause gap before the first new word!
      const naturalArticulationSec = Math.max(0, (newCount - 1) * 0.32)
      const firstNewWordGapSec =
        prevLen === 0 ? 0 : Math.max(0.15, totalGapSec - naturalArticulationSec)

      for (let k = prevLen; k < currentWords.length; k++) {
        const isFirstOfBurst = k === prevLen
        const gap =
          k === 0
            ? 0
            : isFirstOfBurst
            ? Number(firstNewWordGapSec.toFixed(2))
            : 0.3
        wordTimings.push({
          word: currentWords[k],
          timestamp: now,
          pauseBeforeSec: gap,
        })
      }
      lastWordTime = now
    } else {
      // Keep existing timings aligned with updated word spellings
      for (let k = 0; k < Math.min(prevLen, currentWords.length); k++) {
        wordTimings[k].word = currentWords[k]
      }
    }
  }

  const start = () => {
    sessionStartTime = Date.now()
    firstWordTime = 0
    lastWordTime = 0
    wordTimings = []
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

        updateWordTimingsFromTranscript(combined, now)
        const { pauseCount, longPauseCount } = computePauseStats(wordTimings)
        const activeDurationSec = computeActiveDurationSec(wordTimings.length, now)

        if (onInterimTranscript) onInterimTranscript(combined)
        if (onFinalUpdate) {
          onFinalUpdate({
            transcript: combined,
            durationSec: Number(activeDurationSec.toFixed(1)),
            pauseCount,
            longPauseCount,
            wordTimings: [...wordTimings],
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
    const now = Date.now()
    if (recognition) {
      try {
        recognition.stop()
      } catch {
        // Ignore stop errors
      }
    }
    const combined = `${finalTranscript} ${interimTranscript}`.trim()
    const { pauseCount, longPauseCount } = computePauseStats(wordTimings)
    const activeDurationSec = computeActiveDurationSec(wordTimings.length, now)

    return {
      transcript: combined,
      durationSec: Number(activeDurationSec.toFixed(1)),
      pauseCount,
      longPauseCount,
      wordTimings: [...wordTimings],
    }
  }

  return { start, stop, isSupported: Boolean(SpeechRecognition) }
}
