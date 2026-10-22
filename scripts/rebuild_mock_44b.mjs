import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const projectRoot = process.cwd();
const dumpDir = path.join(
  '/Users/pablo/.gemini/antigravity-cli/brain/a4280b1f-94fa-4054-b0b5-d86f1895369e/scratch/apeuni_mock_51710076'
);
const publicMediaDir = path.join(projectRoot, 'public', 'apeuni_media');
const dataFilePath = path.join(projectRoot, 'src', 'data', 'apeuniScrapedBank.js');

const SHORT_TO_CODE = {
  RA: { code: 'RA', section: 'speaking' },
  RS: { code: 'RS', section: 'speaking' },
  DI: { code: 'DI', section: 'speaking' },
  RL: { code: 'RL', section: 'speaking' },
  ASQ: { code: 'ASQ', section: 'speaking' },
  SGD: { code: 'SGD', section: 'speaking' },
  RTS: { code: 'RTS', section: 'speaking' },
  SWT: { code: 'SWT', section: 'writing' },
  WE: { code: 'WE', section: 'writing' },
  FIB: { code: 'RWFIB', section: 'reading' },
  'MCM-R': { code: 'MCMA_R', section: 'reading' },
  RO: { code: 'ROP', section: 'reading' },
  'FIBD&D': { code: 'RFIB', section: 'reading' },
  'MCS-R': { code: 'MCSA_R', section: 'reading' },
  SST: { code: 'SST', section: 'listening' },
  'MCM-L': { code: 'MCMA_L', section: 'listening' },
  'FIB-L': { code: 'LFIB', section: 'listening' },
  HCS: { code: 'HCS', section: 'listening' },
  'MCS-L': { code: 'MCSA_L', section: 'listening' },
  SMW: { code: 'SMW', section: 'listening' },
  HIW: { code: 'HIW', section: 'listening' },
  WFD: { code: 'WFD', section: 'listening' },
};

function mapDifficulty(labels = []) {
  const diffLabel = (labels || []).find(l => l.id === 'difficulty')?.label || '';
  if (diffLabel === 'Hard') return 'C2';
  if (diffLabel === 'Easy') return 'B2';
  return 'C1';
}

function resolveLocalMediaUrl(url, defaultExt = 'mp3') {
  if (!url || typeof url !== 'string') return null;
  try {
    const parsed = new URL(url);
    const base = path.basename(parsed.pathname);
    if (fs.existsSync(path.join(publicMediaDir, base))) {
      return `/apeuni_media/${base}`;
    }
    if (fs.existsSync(path.join(publicMediaDir, 'audio', base))) {
      return `/apeuni_media/audio/${base}`;
    }
    const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 10);
    const ext = path.extname(base) || `.${defaultExt}`;
    const nameWithoutExt = path.basename(base, ext).slice(0, 30);
    const hashedName = `${hash}_${nameWithoutExt}${ext}`;
    if (fs.existsSync(path.join(publicMediaDir, 'audio', hashedName))) {
      return `/apeuni_media/audio/${hashedName}`;
    }
    if (fs.existsSync(path.join(publicMediaDir, 'images', hashedName))) {
      return `/apeuni_media/images/${hashedName}`;
    }
    return `/apeuni_media/${base}`;
  } catch {
    return null;
  }
}

function extractKeywordsFromText(txt = '', count = 8) {
  const stop = new Set([
    'that', 'this', 'with', 'from', 'have', 'been', 'were', 'they', 'their', 'which',
    'about', 'would', 'there', 'could', 'other', 'into', 'more', 'some', 'such', 'than',
    'then', 'them', 'these', 'those', 'when', 'where', 'while', 'what', 'following',
    'graph', 'gives', 'information', 'according', 'picture', 'speaker', 'students',
  ]);
  const words = String(txt || '')
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map(w => w.trim())
    .filter(w => w.length >= 5 && !stop.has(w.toLowerCase()));
  return [...new Set(words)].slice(0, count);
}

function convertApeQuestionFull(q, sourceTag = 'mock_44b') {
  const info = SHORT_TO_CODE[q.pte_short_name] || SHORT_TO_CODE[q.kind] || SHORT_TO_CODE.RA;
  const code = info.code;
  const section = info.section;
  const num = q.num || q.id;
  const id = `ape_${code.toLowerCase()}_${num}`;
  const title = q.name || q.title || `#${num} ${code}`;
  const difficulty = mapDifficulty(q.labels);

  const rawAudioUrl = q.audio_url || q.resource?.audio_url || null;
  const rawImageUrl = q.image_url || q.resource?.image_url || null;
  const audioUrl = resolveLocalMediaUrl(rawAudioUrl, 'mp3');
  const imageUrl = resolveLocalMediaUrl(rawImageUrl, 'png');

  const base = {
    id,
    apeuniNum: num,
    taskType: code,
    section,
    title,
    difficulty,
    source: sourceTag,
    audioUrl,
    imageUrl,
    sharedLink: q.question_shared_link || null,
  };

  if (code === 'RA') {
    const promptText = q.text || q.original_text || q.prediction_text || '';
    if (!promptText) return null;
    return { ...base, promptText };
  }

  if (code === 'RS' || code === 'WFD') {
    const audioScript = q.text || q.original_text || q.prediction_text || q.transcript || '';
    if (!audioScript) return null;
    return {
      ...base,
      promptText:
        code === 'RS'
          ? 'Listen to the sentence and repeat it verbatim.'
          : 'Listen carefully and type the exact sentence.',
      audioScript,
    };
  }

  if (code === 'DI') {
    const refAnswer =
      (Array.isArray(q.answer) ? q.answer[0]?.content : q.answer) ||
      q.text ||
      q.original_text ||
      q.prediction_text ||
      '';
    return {
      ...base,
      promptText:
        'Look at the image below. In 25 seconds, please speak into the microphone and describe in detail what the image is showing. You have 40 seconds to give your response.',
      referenceAnswer: refAnswer,
      keywords: extractKeywordsFromText(refAnswer, 8),
    };
  }

  if (code === 'RL' || code === 'SGD') {
    const audioScript = q.transcript || q.text || q.original_text || q.prediction_text || '';
    if (!audioScript) return null;
    const refAnswer =
      (Array.isArray(q.answer) ? q.answer[0]?.content : q.answer) || '';
    return {
      ...base,
      promptText:
        code === 'RL'
          ? 'Listen to the lecture and retell the main points in your own words in 40 seconds.'
          : 'Listen to the three speakers discussing the topic and summarize their viewpoints in 2 minutes.',
      audioScript,
      referenceAnswer: refAnswer,
      keywords: extractKeywordsFromText(refAnswer || audioScript, 8),
    };
  }

  if (code === 'RTS') {
    const promptText = q.text || q.original_text || q.prediction_text || q.transcript || '';
    if (!promptText) return null;
    const refAnswer =
      (Array.isArray(q.answer) ? q.answer[0]?.content : q.answer) || '';
    return {
      ...base,
      promptText,
      audioScript: promptText,
      referenceAnswer: refAnswer,
      keywords: extractKeywordsFromText(refAnswer || promptText, 7),
    };
  }

  if (code === 'ASQ') {
    const raw = q.transcript || q.text || q.original_text || q.prediction_text || '';
    if (!raw) return null;
    const parts = raw.split(/Answer:\s*/i);
    const questionPart = (parts[0] || raw).trim();
    const ansPart = (parts[1] || q.answer_in_text || '').trim();
    const acceptedAnswers = ansPart
      .split(/[\/,;]+/)
      .map(s => s.replace(/\(.*?\)/g, '').trim())
      .filter(Boolean);
    if (acceptedAnswers.length === 0) return null;
    return {
      ...base,
      promptText: 'Listen to the short question and answer in one or two words.',
      audioScript: questionPart,
      acceptedAnswers,
    };
  }

  if (code === 'SWT' || code === 'WE') {
    const promptText = q.text || q.original_text || q.question || q.prediction_text || '';
    if (!promptText) return null;
    const refAnswer =
      q.full_mark_answer ||
      (Array.isArray(q.answer) ? q.answer[0]?.content : q.answer) ||
      '';
    return {
      ...base,
      promptText,
      referenceAnswer: refAnswer,
      keywords: extractKeywordsFromText(refAnswer || promptText, 8),
    };
  }

  if (code === 'SST') {
    const audioScript = q.transcript || q.text || q.original_text || q.prediction_text || '';
    if (!audioScript) return null;
    const refAnswer =
      (Array.isArray(q.answer) ? q.answer[0]?.content : q.answer) || '';
    return {
      ...base,
      promptText: 'Listen to the lecture and write a summary of 50 to 70 words (10 minutes).',
      audioScript,
      referenceAnswer: refAnswer,
      keywords: extractKeywordsFromText(refAnswer || audioScript, 8),
    };
  }

  if (code === 'RWFIB') {
    const rawText = q.text || q.original_text || '';
    const ch = q.choices;
    if (!rawText || !ch || typeof ch !== 'object' || Array.isArray(ch)) return null;
    let promptText = rawText;
    const blanks = [];
    for (const [k, arr] of Object.entries(ch)) {
      if (!Array.isArray(arr)) continue;
      const bId = `b${k}`;
      promptText = promptText.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), `{{${bId}}}`);
      const corrObj = arr.find(x => x.correct);
      const options = arr.map(x => x.choice).filter(Boolean);
      if (corrObj?.choice && options.length > 0) {
        blanks.push({ id: bId, answer: corrObj.choice, options });
      }
    }
    if (blanks.length === 0) return null;
    return { ...base, promptText, blanks };
  }

  if (code === 'RFIB') {
    const rawText = q.text || q.original_text || '';
    const ch = q.choices;
    if (!rawText || !Array.isArray(ch)) return null;
    let promptText = rawText;
    const blanks = [];
    const wordBank = [];
    const blankNums = [...new Set((rawText.match(/\{\{(\d+)\}\}/g) || []).map(m => m.replace(/\D/g, '')))];
    for (const item of ch) {
      if (typeof item === 'object' && item.choice) {
        wordBank.push(item.choice);
      }
    }
    for (const k of blankNums) {
      const bId = `b${k}`;
      promptText = promptText.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), `{{${bId}}}`);
      const matchChoice = ch.find(x => String(x.id) === String(k));
      if (matchChoice?.choice) {
        blanks.push({ id: bId, answer: matchChoice.choice });
      }
    }
    if (blanks.length === 0) return null;
    return { ...base, promptText, blanks, wordBank };
  }

  if (code === 'LFIB') {
    const rawText = q.text || q.original_text || '';
    const ch = q.choices;
    if (!rawText || !ch || typeof ch !== 'object') return null;
    let promptText = rawText;
    let audioScript = rawText;
    const blanks = [];
    for (const [k, obj] of Object.entries(ch)) {
      const bId = `b${k}`;
      const ans = Array.isArray(obj?.truth) ? obj.truth[0] : obj?.truth;
      if (!ans) continue;
      promptText = promptText.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), `{{${bId}}}`);
      audioScript = audioScript.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), ans);
      blanks.push({ id: bId, answer: ans });
    }
    if (blanks.length === 0) return null;
    return { ...base, promptText, audioScript, blanks };
  }

  if (code === 'ROP') {
    const paras = q.paras;
    if (!Array.isArray(paras) || paras.length < 2) return null;
    const paragraphs = paras.map(p => ({
      id: `p${p.id}`,
      text: p.para,
    }));
    const sorted = [...paras].sort((a, b) => Number(a.order) - Number(b.order));
    const correctOrder = sorted.map(p => `p${p.id}`);
    return { ...base, paragraphs, correctOrder };
  }

  if (code === 'MCMA_R' || code === 'MCMA_L') {
    const ch = q.choices;
    if (!Array.isArray(ch) || ch.length === 0) return null;
    const passage = q.text || q.transcript || q.original_text || '';
    const qPrompt = q.question || '';
    const options = ch.map((c, i) => ({
      id: c.label || c.index || String.fromCharCode(65 + i),
      text: c.choice,
    }));
    const correctOptions = ch
      .map((c, i) => (c.correct ? c.label || c.index || String.fromCharCode(65 + i) : null))
      .filter(Boolean);
    if (correctOptions.length === 0) return null;
    return {
      ...base,
      promptText:
        code === 'MCMA_R'
          ? `${passage}\n\n${qPrompt}`.trim()
          : qPrompt || 'Select all correct options based on the recording.',
      audioScript: code === 'MCMA_L' ? passage : undefined,
      options,
      correctOptions,
    };
  }

  if (code === 'MCSA_R' || code === 'MCSA_L' || code === 'HCS' || code === 'SMW') {
    const ch = q.choices;
    if (!Array.isArray(ch) || ch.length === 0) return null;
    const passage = q.text || q.transcript || q.original_text || '';
    const qPrompt = q.question || '';
    const options = ch.map((c, i) => ({
      id: c.label || c.index || String.fromCharCode(65 + i),
      text: c.choice,
    }));
    const corr = ch.find(c => c.correct);
    const correctOption = corr
      ? corr.label || corr.index || String.fromCharCode(65 + ch.indexOf(corr))
      : 'A';
    return {
      ...base,
      promptText:
        code === 'MCSA_R'
          ? `${passage}\n\n${qPrompt}`.trim()
          : qPrompt || 'Listen to the recording and select the single best option.',
      audioScript: code !== 'MCSA_R' ? passage : undefined,
      options,
      correctOption,
    };
  }

  if (code === 'HIW') {
    const rawText = q.text || '';
    const ch = q.choices;
    if (!rawText || !ch || typeof ch !== 'object') return null;
    const rawTokens = rawText.trim().split(/\s+/);
    const displayWords = [];
    const incorrectIndices = [];
    const replacements = {};
    let audioWords = [];

    rawTokens.forEach((tok, idx) => {
      const m = tok.match(/^\{\{(\d+)\}\}(.*)$/);
      if (m) {
        const key = m[1];
        const punct = m[2] || '';
        const pair = ch[key];
        if (pair) {
          displayWords.push(`${pair.choice}${punct}`);
          audioWords.push(`${pair.truth}${punct}`);
          incorrectIndices.push(idx);
          replacements[idx] = { spoken: pair.truth, displayed: pair.choice };
          return;
        }
      }
      displayWords.push(tok);
      audioWords.push(tok);
    });

    if (incorrectIndices.length === 0) return null;
    return {
      ...base,
      audioScript: q.original_text || audioWords.join(' '),
      displayWords,
      incorrectIndices,
      replacements,
    };
  }

  return null;
}

function buildMock44BAttemptFull(detail, convertedItem) {
  const a = detail.answer;
  if (!a || !convertedItem) return null;

  const code = convertedItem.taskType;
  const rawScore = Number(a.total_score ?? 0);
  const maxScore = Number(a.plain_max_score ?? a.scores?.overall?.max ?? 90);
  const pct = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0;
  const pteEq = maxScore === 90 ? Math.round(rawScore) : Math.round(10 + (pct / 100) * 80);

  const subscores = {};
  const comps = a.scores?.components || {};
  for (const [k, v] of Object.entries(comps)) {
    subscores[k] = {
      score: v.score,
      max: v.max,
    };
  }

  const userResponse = {};
  if (convertedItem.section === 'speaking') {
    userResponse.transcript =
      a.text ||
      a.recognized_text ||
      `[Mock Test 44B Audio Recording — ${a.timetaken}s]`;
    userResponse.audioRecordingUrl = a.audio_url || null;
  } else if (code === 'SWT' || code === 'WE' || code === 'SST' || code === 'WFD') {
    userResponse.textAnswer = (a.text || '').replace(/\s*\(\d+\s*Incorrect:.*?\)\s*$/i, '').trim();
  } else if (code === 'RWFIB' || code === 'RFIB' || code === 'LFIB') {
    const parts = String(a.text || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const blanks = {};
    (convertedItem.blanks || []).forEach((b, i) => {
      if (parts[i]) blanks[b.id] = parts[i];
    });
    userResponse.blanks = blanks;
  } else if (code === 'MCMA_R' || code === 'MCMA_L') {
    userResponse.selectedOptions = String(a.text || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  } else if (code === 'MCSA_R' || code === 'MCSA_L' || code === 'HCS' || code === 'SMW') {
    userResponse.selectedOption = String(a.text || '').trim();
  } else if (code === 'ROP') {
    const orderNums = String(a.text || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    userResponse.userOrder = orderNums.map(n => `p${n}`);
  } else if (code === 'HIW') {
    userResponse.selectedIndices = [...(convertedItem.incorrectIndices || [])];
  }

  const feedbackParts = Object.entries(comps)
    .map(([k, v]) => `${k}: ${v.score}/${v.max}`)
    .join(' • ');

  const localRec = a.audio_file_name
    ? `/apeuni_media/recordings_mock_44b/${a.audio_file_name}`
    : null;

  return {
    id: `att_mock44b_${convertedItem.id}`,
    itemId: convertedItem.id,
    taskType: code,
    section: convertedItem.section,
    isMock44BBaseline: true,
    userAudioUrl: localRec,
    userResponse,
    scores: {
      taskType: code,
      section: convertedItem.section,
      rawPoints: rawScore,
      maxPoints: maxScore,
      percentage: pct,
      pteScaleEquivalent: pteEq,
      subscores,
      feedback: `[Mock Test 44B Official Result: ${rawScore}/${maxScore}] ${feedbackParts}`,
    },
    feedback: {
      text: `[Mock Test 44B Official Result: ${rawScore}/${maxScore}] ${feedbackParts}`,
    },
    durationSec: a.timetaken || 60,
    createdAt: a.created_at || '2026-10-22T03:19:00.000Z',
  };
}

// Convert all 65 items of Mock 44B
const mock44BQuestions = [];
const mock44BAttempts = [];
const mock44BIds = [];

for (const div of ['speaking', 'writing', 'reading', 'listening']) {
  const file = path.join(dumpDir, `dec_view_${div}_p1.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const detail of data.record_details?.details || []) {
    const q = detail.question;
    const converted = convertApeQuestionFull(q, 'mock_44b');
    if (!converted) {
      console.error(`Failed to convert ${q.pte_short_name} #${q.num}`);
      continue;
    }
    converted.mockExamBadge = 'Mock 44B';
    mock44BQuestions.push(converted);
    mock44BIds.push(converted.id);
    const att = buildMock44BAttemptFull(detail, converted);
    if (att) mock44BAttempts.push(att);
  }
}

console.log(
  `Successfully converted ${mock44BQuestions.length} Mock 44B questions and ${mock44BAttempts.length} baseline attempts.`
);

// Verify no missing blanks/options
const broken = mock44BQuestions.filter(q => {
  if ((q.taskType === 'RWFIB' || q.taskType === 'RFIB' || q.taskType === 'LFIB') && (!q.blanks || q.blanks.length === 0)) return true;
  if (q.taskType === 'ROP' && (!q.paragraphs || q.paragraphs.length < 2)) return true;
  if (q.taskType === 'HIW' && (!q.incorrectIndices || q.incorrectIndices.length === 0)) return true;
  if ((q.taskType === 'MCMA_R' || q.taskType === 'MCMA_L') && (!q.options || q.options.length === 0)) return true;
  if ((q.taskType === 'MCSA_R' || q.taskType === 'MCSA_L' || q.taskType === 'HCS' || q.taskType === 'SMW') && (!q.options || q.options.length === 0)) return true;
  return false;
});

if (broken.length > 0) {
  console.error(`BROKEN QUESTIONS DETECTED: ${broken.length}`);
  broken.forEach(b => console.error(` - ${b.id} (${b.taskType})`));
  process.exit(1);
} else {
  console.log(`ALL 65 QUESTIONS VERIFIED 100% HEALTHY! No broken structures.`);
}

// Now update apeuniScrapedBank.js
const currentBankContent = fs.readFileSync(dataFilePath, 'utf8');

// Read existing questions
const matchQuestions = currentBankContent.match(/export const APEUNI_SCRAPED_QUESTIONS = (\[[\s\S]*?\]);\s*$/);
const currentAllQuestions = JSON.parse(matchQuestions[1]);

// Remove any older mock_44b entries from APEUNI_SCRAPED_QUESTIONS and replace with the healthy ones
const non44BQuestions = currentAllQuestions.filter(q => q.source !== 'mock_44b');
const non44BIds = new Set(non44BQuestions.map(q => q.id));

const newlyAddedQuestions = [];
for (const q of mock44BQuestions) {
  if (!non44BIds.has(q.id)) {
    newlyAddedQuestions.push(q);
    non44BIds.add(q.id);
  } else {
    // If it already existed in apeuni_bank, mark it with mockExamBadge
    const existing = non44BQuestions.find(x => x.id === q.id);
    if (existing && !existing.mockExamBadge) {
      existing.mockExamBadge = 'Mock 44B';
    }
  }
}

const finalQuestions = [...non44BQuestions, ...newlyAddedQuestions];
console.log(`Final combined questions count: ${finalQuestions.length}`);

// Extract APEUNI_MOCK_45C_IDS, APEUNI_MOCK_A_IDS, APEUNI_MOCK_45C_ATTEMPTS
const match45cIds = currentBankContent.match(/export const APEUNI_MOCK_45C_IDS = (\[[\s\S]*?\]);/);
const matchAIds = currentBankContent.match(/export const APEUNI_MOCK_A_IDS = (\[[\s\S]*?\]);/);
const match45cAtt = currentBankContent.match(/export const APEUNI_MOCK_45C_ATTEMPTS = (\[[\s\S]*?\]);/);

const newBankFileContent = `/**
 * Official APEUni Scraped & Decrypted Question Bank + Full Mock Test Replays
 * All media (MP3s, images, user recordings) downloaded to /apeuni_media for 100% offline access!
 * Includes:
 * - 【VIP Full Test】PTE Mock Test 45C (65 items + baseline attempts)
 * - 【VIP Full Test】PTE Mock Test 44B (65 items + baseline attempts, score 71/90)
 * - 【Full Exam】PTE Mock Test A (ID: 850) (65 items offline)
 * - Complete Scraped Practice Bank (total: ${finalQuestions.length} real exam items)
 */

export const APEUNI_MOCK_45C_IDS = ${match45cIds[1]};

export const APEUNI_MOCK_44B_IDS = ${JSON.stringify(mock44BIds, null, 2)};

export const APEUNI_MOCK_A_IDS = ${matchAIds[1]};

export const APEUNI_MOCK_45C_ATTEMPTS = ${match45cAtt[1]};

export const APEUNI_MOCK_44B_ATTEMPTS = ${JSON.stringify(mock44BAttempts, null, 2)};

export const APEUNI_SCRAPED_QUESTIONS = ${JSON.stringify(finalQuestions, null, 2)};
`;

fs.writeFileSync(dataFilePath, newBankFileContent);
console.log(`Successfully updated ${dataFilePath}!`);
