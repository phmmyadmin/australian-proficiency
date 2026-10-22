import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const projectRoot = process.cwd();
const publicMediaDir = path.join(projectRoot, 'public', 'apeuni_media');
const audioDir = path.join(publicMediaDir, 'audio');
const imgDir = path.join(publicMediaDir, 'images');
const recDir = path.join(publicMediaDir, 'recordings');

fs.mkdirSync(audioDir, { recursive: true });
fs.mkdirSync(imgDir, { recursive: true });
fs.mkdirSync(recDir, { recursive: true });

function getLocalMediaFilename(url, defaultExt = 'mp3') {
  if (!url || typeof url !== 'string') return null;
  const hash = crypto.createHash('md5').update(url).digest('hex').slice(0, 10);
  try {
    const parsed = new URL(url);
    const base = path.basename(parsed.pathname).replace(/[^a-zA-Z0-9._-]/g, '_');
    const ext = path.extname(base) || `.${defaultExt}`;
    const nameWithoutExt = path.basename(base, ext).slice(0, 30);
    return `${hash}_${nameWithoutExt}${ext}`;
  } catch {
    return `${hash}.${defaultExt}`;
  }
}

async function downloadFile(url, destPath) {
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 100) {
    return { status: 'skipped', path: destPath };
  }
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      },
    });
    if (!res.ok) {
      return { status: 'failed', code: res.status, url };
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.length < 50) {
      return { status: 'failed_empty', url };
    }
    fs.writeFileSync(destPath, buffer);
    return { status: 'downloaded', size: buffer.length };
  } catch (err) {
    return { status: 'error', error: err.message, url };
  }
}

async function runPool(items, concurrency, fn) {
  const results = [];
  let index = 0;
  const total = items.length;

  async function worker() {
    while (index < total) {
      const i = index++;
      const item = items[i];
      const res = await fn(item, i, total);
      results.push(res);
      if (results.length % 50 === 0 || results.length === total) {
        console.log(`[Progress] ${results.length}/${total} files processed...`);
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, total) }, () => worker());
  await Promise.all(workers);
  return results;
}

async function main() {
  console.log('--- Loading APEUni Question Bank & Mock 850 ---');
  const { APEUNI_SCRAPED_QUESTIONS, APEUNI_MOCK_45C_ATTEMPTS, APEUNI_MOCK_45C_IDS } =
    await import('../src/data/apeuniScrapedBank.js');

  const mock850Path = path.join(
    '/Users/pablo/.gemini/antigravity-cli/brain/a4280b1f-94fa-4054-b0b5-d86f1895369e/scratch/mock_exam_850_decrypted.json'
  );
  let mock850Data = null;
  if (fs.existsSync(mock850Path)) {
    mock850Data = JSON.parse(fs.readFileSync(mock850Path, 'utf8'));
  }

  // Collect unique download tasks
  const downloadTasks = [];
  const urlToLocalAudioMap = new Map();
  const urlToLocalImgMap = new Map();
  const urlToLocalRecMap = new Map();

  function registerAudio(url) {
    if (!url || !url.startsWith('http')) return url;
    if (!urlToLocalAudioMap.has(url)) {
      const filename = getLocalMediaFilename(url, 'mp3');
      const dest = path.join(audioDir, filename);
      urlToLocalAudioMap.set(url, `/apeuni_media/audio/${filename}`);
      downloadTasks.push({ type: 'audio', url, dest });
    }
    return urlToLocalAudioMap.get(url);
  }

  function registerImage(url) {
    if (!url || !url.startsWith('http')) return url;
    if (!urlToLocalImgMap.has(url)) {
      const filename = getLocalMediaFilename(url, 'png');
      const dest = path.join(imgDir, filename);
      urlToLocalImgMap.set(url, `/apeuni_media/images/${filename}`);
      downloadTasks.push({ type: 'image', url, dest });
    }
    return urlToLocalImgMap.get(url);
  }

  function registerRecording(url) {
    if (!url || !url.startsWith('http')) return url;
    if (!urlToLocalRecMap.has(url)) {
      const filename = getLocalMediaFilename(url, 'wav');
      const dest = path.join(recDir, filename);
      urlToLocalRecMap.set(url, `/apeuni_media/recordings/${filename}`);
      downloadTasks.push({ type: 'recording', url, dest });
    }
    return urlToLocalRecMap.get(url);
  }

  // 1. Process current scraped bank questions
  for (const q of APEUNI_SCRAPED_QUESTIONS) {
    if (q.audioUrl) registerAudio(q.audioUrl);
    if (q.imageUrl) registerImage(q.imageUrl);
  }

  // 2. Process Pablo's 32 recordings
  for (const att of APEUNI_MOCK_45C_ATTEMPTS) {
    if (att.userAudioUrl) registerRecording(att.userAudioUrl);
  }

  // 3. Process Mock Test A (850)
  const mockAQuestions = [];
  const mockAIds = [];

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

  const MODEL_TO_CODE = {
    read_alouds: 'RA',
    repeat_sentences: 'RS',
    describe_images: 'DI',
    retell_lectures: 'RL',
    answer_questions: 'ASQ',
    summarize_group_discussions: 'SGD',
    ptea_respond_situations: 'RTS',
    swts: 'SWT',
    essays: 'WE',
    fib_wr: 'RWFIB',
    r_mcm: 'MCMA_R',
    ro: 'ROP',
    fib_rd: 'RFIB',
    r_mcs: 'MCSA_R',
    ssts: 'SST',
    l_mcm: 'MCMA_L',
    l_fib: 'LFIB',
    l_hcs: 'HCS',
    l_mcs: 'MCSA_L',
    l_smw: 'SMW',
    hiws: 'HIW',
    wfds: 'WFD',
  };

  if (mock850Data && mock850Data.mock_exam_specification) {
    for (const part of Object.values(mock850Data.mock_exam_specification)) {
      for (const grp of part.mock_exam_groups || []) {
        for (const t of grp.mock_exam_tasks || []) {
          if (!t.need_submission || !t.item?.data) continue;
          const d = t.item.data;
          const code =
            SHORT_TO_CODE[d.pte_short_name]?.code ||
            MODEL_TO_CODE[t.model] ||
            'RA';
          const info = SHORT_TO_CODE[code] || SHORT_TO_CODE.RA;
          const num = d.num || d.id;
          const id = `ape_mocka_${code.toLowerCase()}_${num}`;
          mockAIds.push(id);

          const rawAudio = d.audio_url || d.audio || d.en_au_wavenet_b || null;
          const rawImage = d.image_url || d.img_url || d.image || null;

          if (rawAudio) registerAudio(rawAudio);
          if (rawImage) registerImage(rawImage);

          const qObj = {
            id,
            apeuniNum: num,
            taskType: code,
            section: info.section,
            title: d.name || d.title || `#${num} ${code}`,
            difficulty: 'C1',
            source: 'apeuni_mock_a',
            audioUrl: rawAudio ? urlToLocalAudioMap.get(rawAudio) : null,
            imageUrl: rawImage ? urlToLocalImgMap.get(rawImage) : null,
            sharedLink: d.question_shared_link || null,
          };

          if (code === 'RA') {
            qObj.promptText = d.text || '';
          } else if (code === 'RS') {
            qObj.promptText = 'Listen to the recording and repeat the sentence.';
            qObj.audioScript = d.text || '';
          } else if (code === 'DI') {
            qObj.promptText = 'Describe the image shown.';
            qObj.keywords = (d.keywords || []).map(k => (typeof k === 'string' ? k : k.name));
            qObj.referenceAnswer = d.model_answer || d.transcript || null;
          } else if (code === 'RL') {
            qObj.promptText = 'Listen to the lecture and retell in your own words.';
            qObj.audioScript = d.text || d.transcript || '';
            qObj.keywords = (d.keywords || []).map(k => (typeof k === 'string' ? k : k.name));
            qObj.referenceAnswer = d.model_answer || null;
          } else if (code === 'ASQ') {
            qObj.promptText = 'Answer the question with a single word or short phrase.';
            qObj.audioScript = d.text || '';
            qObj.acceptedAnswers = Array.isArray(d.answers) ? d.answers : [d.answer || ''];
          } else if (code === 'SGD' || code === 'RTS') {
            qObj.promptText = d.prompt || d.text || 'Respond to the prompt.';
            qObj.audioScript = d.audio_text || d.text || '';
            qObj.keywords = (d.keywords || []).map(k => (typeof k === 'string' ? k : k.name));
          } else if (code === 'SWT') {
            qObj.promptText = d.text || '';
            qObj.keywords = (d.keywords || []).map(k => (typeof k === 'string' ? k : k.name));
            qObj.referenceAnswer = d.model_answer || null;
          } else if (code === 'WE') {
            qObj.promptText = d.text || '';
            qObj.keywords = (d.keywords || []).map(k => (typeof k === 'string' ? k : k.name));
            qObj.referenceAnswer = d.model_answer || null;
          } else if (code === 'RWFIB' || code === 'RFIB') {
            const rawBody = d.text || d.body || '';
            const blanks = [];
            const parts = rawBody.split(/(\{\{b\d+\}\})/g);
            let bIdx = 1;
            const cleanText = parts
              .map(part => {
                if (/^\{\{b\d+\}\}$/.test(part)) {
                  const bid = `b${bIdx}`;
                  const bDef = (d.blanks || [])[bIdx - 1] || {};
                  blanks.push({
                    id: bid,
                    answer: bDef.answer || '',
                    options: bDef.options || [],
                  });
                  bIdx++;
                  return `{{${bid}}}`;
                }
                return part;
              })
              .join('');
            qObj.promptText = cleanText || rawBody;
            qObj.blanks = blanks;
            if (code === 'RFIB' && d.word_bank) qObj.wordBank = d.word_bank;
          } else if (code === 'ROP') {
            qObj.paragraphs = (d.paragraphs || []).map((p, idx) => ({
              id: p.id || `p_${idx + 1}`,
              text: p.text || p.content || '',
            }));
            qObj.correctOrder = d.correct_order || qObj.paragraphs.map(p => p.id);
          } else if (code === 'MCMA_R' || code === 'MCSA_R' || code === 'MCMA_L' || code === 'MCSA_L') {
            qObj.promptText = d.text || d.passage || '';
            if (code.endsWith('_L')) qObj.audioScript = d.transcript || '';
            qObj.options = (d.options || []).map((o, idx) => ({
              id: String.fromCharCode(65 + idx),
              text: o.text || o,
            }));
            if (code.startsWith('MCMA')) {
              qObj.correctOptions = (d.answers || []).map(a =>
                typeof a === 'number' ? String.fromCharCode(65 + a) : a
              );
            } else {
              const ansIdx = typeof d.answer === 'number' ? d.answer : 0;
              qObj.correctOption = String.fromCharCode(65 + ansIdx);
            }
          } else if (code === 'SST') {
            qObj.audioScript = d.text || d.transcript || '';
            qObj.keywords = (d.keywords || []).map(k => (typeof k === 'string' ? k : k.name));
            qObj.referenceAnswer = d.model_answer || null;
          } else if (code === 'LFIB') {
            qObj.audioScript = d.transcript || '';
            qObj.promptText = d.text || '';
            qObj.blanks = (d.blanks || []).map((b, idx) => ({
              id: `b${idx + 1}`,
              answer: b.answer || b,
            }));
          } else if (code === 'HCS' || code === 'SMW') {
            qObj.audioScript = d.transcript || '';
            qObj.options = (d.options || []).map((o, idx) => ({
              id: String.fromCharCode(65 + idx),
              text: o.text || o,
            }));
            const ansIdx = typeof d.answer === 'number' ? d.answer : 0;
            qObj.correctOption = String.fromCharCode(65 + ansIdx);
          } else if (code === 'HIW') {
            qObj.audioScript = d.transcript || '';
            qObj.displayWords = (d.text || '').split(/\s+/).filter(Boolean);
            qObj.incorrectIndices = d.incorrect_indices || [];
          } else if (code === 'WFD') {
            qObj.promptText = 'Type the exact sentence you hear.';
            qObj.audioScript = d.text || '';
          }

          mockAQuestions.push(qObj);
        }
      }
    }
  }

  console.log(`\n=== Total Media Files to Download: ${downloadTasks.length} ===`);
  console.log(`- Audios: ${urlToLocalAudioMap.size}`);
  console.log(`- Images: ${urlToLocalImgMap.size}`);
  console.log(`- Pablo Recordings: ${urlToLocalRecMap.size}`);
  console.log(`- Mock A Questions Extracted: ${mockAQuestions.length}`);

  // Download all files concurrently (15 parallel streams)
  const results = await runPool(downloadTasks, 15, async (task, i, total) => {
    return downloadFile(task.url, task.dest);
  });

  const downloadedCount = results.filter(r => r.status === 'downloaded').length;
  const skippedCount = results.filter(r => r.status === 'skipped').length;
  const failedCount = results.filter(r => r.status.includes('fail') || r.status === 'error').length;

  console.log(`\n=== Download Summary ===`);
  console.log(`✓ Newly downloaded: ${downloadedCount}`);
  console.log(`✓ Already existed (skipped): ${skippedCount}`);
  console.log(`⚠️ Failed/Missing on remote: ${failedCount}`);

  // Rewrite URLs in scraped questions to local paths
  const updatedScraped = APEUNI_SCRAPED_QUESTIONS.map(q => {
    const localAudio = q.audioUrl ? urlToLocalAudioMap.get(q.audioUrl) : null;
    const localImg = q.imageUrl ? urlToLocalImgMap.get(q.imageUrl) : null;
    return {
      ...q,
      audioUrl: localAudio || q.audioUrl,
      imageUrl: localImg || q.imageUrl,
    };
  });

  // Rewrite URLs in Pablo's Mock 45C attempts
  const updatedAttempts = APEUNI_MOCK_45C_ATTEMPTS.map(att => {
    const localRec = att.userAudioUrl ? urlToLocalRecMap.get(att.userAudioUrl) : null;
    return {
      ...att,
      userAudioUrl: localRec || att.userAudioUrl,
    };
  });

  // Combine scraped + mock A
  const allFinalQuestions = [...updatedScraped, ...mockAQuestions];

  // Write new apeuniScrapedBank.js
  const bankOutputFile = path.join(projectRoot, 'src', 'data', 'apeuniScrapedBank.js');
  const codeContent = `/**
 * Official APEUni Scraped & Decrypted Question Bank + Full Mock Test Replays
 * All media (MP3s, images, user recordings) downloaded to /apeuni_media for 100% offline access!
 */

export const APEUNI_MOCK_45C_IDS = ${JSON.stringify(APEUNI_MOCK_45C_IDS, null, 2)};

export const APEUNI_MOCK_A_IDS = ${JSON.stringify(mockAIds, null, 2)};

export const APEUNI_MOCK_45C_ATTEMPTS = ${JSON.stringify(updatedAttempts, null, 2)};

export const APEUNI_SCRAPED_QUESTIONS = ${JSON.stringify(allFinalQuestions, null, 2)};
`;

  fs.writeFileSync(bankOutputFile, codeContent);
  console.log(`✓ Successfully updated ${bankOutputFile}`);
  console.log(`✓ Total questions in local bank: ${allFinalQuestions.length}`);
}

main().catch(console.error);
