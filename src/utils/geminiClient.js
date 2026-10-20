import { getActiveGeminiKey } from './aiConfigStore'
import { initCard } from './fsrsEngine'

const GEMINI_MODELS = ['gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-2.5-flash']

async function callGeminiJson(prompt) {
  const apiKey = getActiveGeminiKey()
  if (!apiKey) {
    throw new Error('No Gemini API key configured. Open Settings to check your key.')
  }

  let lastError = null
  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(
      apiKey
    )}`
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: 'application/json',
          },
        }),
      })
      if (!response.ok) {
        const errText = await response.text()
        lastError = new Error(`Model ${model} returned ${response.status}: ${errText.slice(0, 160)}`)
        continue
      }
      const data = await response.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
      if (!text) continue
      const cleaned = text.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim()
      return JSON.parse(cleaned)
    } catch (err) {
      lastError = err
    }
  }
  throw lastError || new Error('Failed to get response from Gemini models.')
}

/**
 * Uses Gemini to grade open-ended PTE Academic Writing & Speaking responses
 * strictly following Pearson's official trait rubrics.
 */
export async function evaluateWithGeminiRubric(item, userResponse) {
  const taskType = item.taskType
  const text = userResponse.transcript || userResponse.textAnswer || ''
  if (!text || text.trim().length < 5) return null

  const prompt = `You are an official Pearson PTE Academic automated scoring engine.
Evaluate the candidate's response for task type "${taskType}" (${item.title}).

Task Prompt / Transcript:
"""
${item.promptText || item.audioScript || ''}
"""
Expected Key Points: ${(item.keywords || []).join(', ')}

Candidate Response:
"""
${text}
"""

Return ONLY a JSON object with numerical scores matching the official PTE Academic trait scale for ${taskType}:
- For WE (Write Essay): { "content": 0..3, "development": 0..2, "grammar": 0..2, "linguisticRange": 0..2, "vocabulary": 0..2, "spelling": 0..2, "feedback": "Concise 2-sentence actionable PTE coaching tip." }
- For SWT (Summarize Written Text): { "content": 0..2, "grammar": 0..2, "vocabulary": 0..2, "feedback": "Concise 2-sentence actionable PTE coaching tip." }
- For SST (Summarize Spoken Text): { "content": 0..2, "grammar": 0..2, "vocabulary": 0..2, "spelling": 0..2, "feedback": "Concise 2-sentence actionable PTE coaching tip." }
- For DI / RL / SGD / RTS (Speaking): { "content": 0..5, "feedback": "Concise 2-sentence actionable PTE coaching tip." }`

  try {
    return await callGeminiJson(prompt)
  } catch {
    return null
  }
}

/**
 * Generates a brand-new official-spec PTE Academic question for any task type using Gemini AI.
 */
export async function generatePteQuestionWithAI(taskType, customTopic = 'Australian Science, Urban Planning & Environment') {
  const prompt = `You are an expert PTE Academic test writer creating an original C1/C2 item set in an Australian academic context.
Task Type: "${taskType}"
Topic Focus: "${customTopic}"

Return ONLY a valid JSON object matching the exact structure required for "${taskType}":
Common required fields:
- "id": "${taskType.toLowerCase()}_ai_${Date.now()}"
- "taskType": "${taskType}"
- "section": one of "speaking", "writing", "reading", "listening"
- "title": descriptive title
- "difficulty": "C1" or "C2"
- "source": "ai_generated"

Task-specific fields:
- If RA: "promptText" (60-75 words academic paragraph)
- If RS: "audioScript" (11-15 words academic sentence), "promptText": "Listen and repeat the sentence."
- If DI: "promptText": "Describe the chart in 40 seconds.", "keywords": [6 key terms], "chartData": { "type": "bar", "title": "...", "unit": "%", "series": [{"label": "2020", "value": 42}, {"label": "2022", "value": 58}, {"label": "2024", "value": 74}, {"label": "2026", "value": 86}] }
- If RL or SGD: "audioScript" (110-140 words lecture/discussion), "keywords": [6 key phrases]
- If RTS: "promptText" (everyday university/workplace situation), "audioScript" (same situation read aloud), "keywords": [5 key phrases]
- If ASQ: "audioScript" (1 concise question), "acceptedAnswers": ["primary answer", "synonym"]
- If SWT: "promptText" (180-220 words academic text), "keywords": [6 key concepts]
- If WE: "promptText" (2-3 sentence argumentative essay prompt), "keywords": [6 academic concepts]
- If RWFIB or RFIB: "promptText" (paragraph containing {{b1}}, {{b2}}, {{b3}}, {{b4}} placeholders), "blanks": [{"id": "b1", "answer": "correctWord", "options": ["correctWord", "distractor1", "distractor2", "distractor3"]}], "wordBank": ["correctWord", "distractor1", ...]
- If MCMA_R or MCMA_L: "promptText" (reading text or question), "audioScript" (if listening), "options": [{"id": "A", "text": "..."}, {"id": "B", "text": "..."}, {"id": "C", "text": "..."}, {"id": "D", "text": "..."}, {"id": "E", "text": "..."}], "correctOptions": ["A", "C"]
- If MCSA_R or MCSA_L or HCS or SMW: "promptText", "audioScript" (if listening), "options": [{"id": "A", "text": "..."}, {"id": "B", "text": "..."}, {"id": "C", "text": "..."}, {"id": "D", "text": "..."}], "correctOption": "B", "explanation": "Why B is correct"
- If ROP: "paragraphs": [{"id": "p1", "text": "..."}, {"id": "p2", "text": "..."}, {"id": "p3", "text": "..."}, {"id": "p4", "text": "..."}], "correctOrder": ["p1", "p2", "p3", "p4"]
- If SST: "audioScript" (120-150 words academic lecture), "keywords": [6 key concepts]
- If LFIB: "audioScript" (full spoken text), "promptText" (same text with {{b1}}, {{b2}}, {{b3}} placeholders), "blanks": [{"id": "b1", "answer": "word1"}, {"id": "b2", "answer": "word2"}, {"id": "b3", "answer": "word3"}]
- If HIW: "audioScript" (true spoken paragraph of ~65 words), "displayWords" (array of all words where 4 indices are replaced with plausible wrong words), "incorrectIndices": [index1, index2, index3, index4]
- If WFD: "audioScript" (10-13 words academic sentence)`

  return await callGeminiJson(prompt)
}

/**
 * Generates new FSRS-5 Flashcards for a given topic (Australian slang, PTE academic collocations, IELTS/PTE C1 idioms, etc.)
 */
export async function generateVocabCardsByTopic(topic, count = 6, category = 'Academic & Aussie') {
  const prompt = `You are an Australian English & PTE Academic C1/C2 lexicographer.
Generate ${count} high-value vocabulary flashcards for the topic: "${topic}" (Category: "${category}").
Include authentic Australian English pronunciation phonetic hints, Australian usage context, PTE Academic collocations, and an academic or Australian example sentence.

Return ONLY a JSON array of objects with these exact fields:
[
  {
    "word": "string (word, collocation, or Aussie expression)",
    "phoneticAu": "string (Australian IPA or phonetic guide, e.g. /ˈstrʌk.tʃə.rəl/)",
    "category": "${category}",
    "topic": "${topic}",
    "meaningEn": "clear English definition",
    "australianContext": "how this word/phrase is used in Australia or in PTE Academic",
    "exampleSentence": "complete example sentence set in Australia or an academic context",
    "synonyms": ["syn1", "syn2"],
    "collocations": ["collocation 1", "collocation 2"]
  }
]`

  const rawCards = await callGeminiJson(prompt)
  const list = Array.isArray(rawCards) ? rawCards : rawCards?.cards || []
  const now = Date.now()
  return list.map((item, idx) => ({
    id: `voc_ai_${now}_${idx}`,
    word: item.word || 'Resilience',
    phoneticAu: item.phoneticAu || '/rɪˈzɪl.i.əns/',
    category: item.category || category,
    topic: item.topic || topic,
    meaningEn: item.meaningEn || '',
    australianContext: item.australianContext || '',
    exampleSentence: item.exampleSentence || '',
    synonyms: Array.isArray(item.synonyms) ? item.synonyms : [],
    collocations: Array.isArray(item.collocations) ? item.collocations : [],
    fsrs: initCard(now),
  }))
}

/**
 * Generates Australian Listening Lab practice segments, comprehension quiz, and vocabulary for a custom YouTube video.
 */
export async function generateYoutubeListeningPack({ youtubeId, title, topic, accentRegion = 'General Australian' }) {
  const prompt = `You are an Australian English listening coach creating interactive exercises for a YouTube video.
Video Title: "${title}"
Topic: "${topic}"
Accent: "${accentRegion}"

Generate:
1. "segments": 3 short dictation/shadowing transcript segments (10-16 words each) with realistic timestamps ("startSec", "endSec", "transcript", "phoneticNote" explaining how an Australian speaker links vowels/drops trailing R).
2. "comprehensionQuestions": 2 multiple-choice listening comprehension questions ("question", "options": ["A...", "B...", "C...", "D..."], "correctIndex": 0..3, "explanation").
3. "vocabulary": 3 Australian English expressions or academic words featured in this topic ("word", "phoneticAu", "meaningEn", "australianContext", "exampleSentence").

Return ONLY valid JSON with keys: "segments", "comprehensionQuestions", "vocabulary".`

  const pack = await callGeminiJson(prompt)
  return {
    id: `yt_${youtubeId}_${Date.now()}`,
    youtubeId,
    title,
    channel: 'Custom Australian YouTube Lab',
    accentRegion,
    topic,
    difficulty: 'C1',
    segments: pack.segments || [],
    comprehensionQuestions: pack.comprehensionQuestions || [],
    vocabulary: pack.vocabulary || [],
  }
}
