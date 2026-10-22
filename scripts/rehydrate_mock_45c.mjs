import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const dumpDir = '/Users/pablo/.gemini/antigravity-cli/brain/a4280b1f-94fa-4054-b0b5-d86f1895369e/scratch/apeuni_dump';
const recDir = path.join(projectRoot, 'public', 'apeuni_media', 'recordings');
const dataFilePath = path.join(projectRoot, 'src', 'data', 'apeuniScrapedBank.js');

const recFiles = fs.readdirSync(recDir);
const attempts = [];

for (const div of ['speaking', 'writing', 'reading', 'listening']) {
  const file = path.join(dumpDir, `dec_view_${div}_p1.json`);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const detail of data.record_details?.details || []) {
    const q = detail.question;
    const a = detail.answer;
    const code =
      q.pte_short_name === 'FIB'
        ? 'RWFIB'
        : q.pte_short_name === 'FIBD&D'
        ? 'RFIB'
        : q.pte_short_name === 'RO'
        ? 'ROP'
        : q.pte_short_name === 'MCM-R'
        ? 'MCMA_R'
        : q.pte_short_name === 'MCS-R'
        ? 'MCSA_R'
        : q.pte_short_name === 'MCM-L'
        ? 'MCMA_L'
        : q.pte_short_name === 'MCS-L'
        ? 'MCSA_L'
        : q.pte_short_name === 'FIB-L'
        ? 'LFIB'
        : q.pte_short_name;

    const id = `ape_${q.pte_short_name.toLowerCase().replace(/[^a-z0-9]/g, '')}_${q.num}`;
    const rawScore = Number(a.total_score ?? 0);
    const maxScore = Number(a.plain_max_score ?? a.scores?.overall?.max ?? (div === 'speaking' ? 90 : 10));
    const pct = maxScore > 0 ? Math.round((rawScore / maxScore) * 100) : 0;
    const pteEq = maxScore === 90 ? Math.round(rawScore) : Math.round(10 + (pct / 100) * 80);

    const subscores = {};
    const comps = a.scores?.components || {};
    for (const [k, v] of Object.entries(comps)) {
      subscores[k] = { score: v.score, max: v.max };
    }

    let localRec = null;
    if (a.audio_file_name) {
      const match = recFiles.find(f => f.includes(a.audio_file_name.slice(0, 25)));
      if (match) localRec = `/apeuni_media/recordings/${match}`;
    }

    const feedbackParts = Object.entries(comps)
      .map(([k, v]) => `${k}: ${v.score}/${v.max}`)
      .join(' • ');

    const userResponse = {};
    if (div === 'speaking') {
      userResponse.transcript =
        a.text || a.recognized_text || `[Mock Test 45C Audio Recording — ${a.timetaken || 60}s]`;
      userResponse.audioRecordingUrl = a.audio_url || null;
    } else if (code === 'SWT' || code === 'WE' || code === 'SST' || code === 'WFD') {
      userResponse.textAnswer = (a.text || '').replace(/\s*\(\d+\s*Incorrect:.*?\)\s*$/i, '').trim();
    } else if (code === 'RWFIB' || code === 'RFIB' || code === 'LFIB') {
      const parts = String(a.text || '').split(',').map(s => s.trim()).filter(Boolean);
      const blanks = {};
      parts.forEach((val, idx) => {
        blanks[`b${idx + 1}`] = val;
      });
      userResponse.blanks = blanks;
    } else if (code === 'MCMA_R' || code === 'MCMA_L') {
      userResponse.selectedOptions = String(a.text || '').split(',').map(s => s.trim()).filter(Boolean);
    } else if (code === 'MCSA_R' || code === 'MCSA_L' || code === 'HCS' || code === 'SMW') {
      userResponse.selectedOption = String(a.text || '').trim();
    } else if (code === 'ROP') {
      const orderNums = String(a.text || '').split(',').map(s => s.trim()).filter(Boolean);
      userResponse.userOrder = orderNums.map(n => `p${n}`);
    } else if (code === 'HIW') {
      userResponse.selectedIndices = [];
    }

    attempts.push({
      id: `att_mock45c_${id}`,
      itemId: id,
      taskType: code,
      section: div,
      isMock45CBaseline: true,
      userAudioUrl: localRec,
      userResponse,
      scores: {
        taskType: code,
        section: div,
        rawPoints: rawScore,
        maxPoints: maxScore,
        percentage: pct,
        pteScaleEquivalent: pteEq,
        subscores,
        feedback: `[Mock Test 45C Official Result: ${rawScore}/${maxScore}] ${feedbackParts}`,
      },
      feedback: {
        text: `[Mock Test 45C Official Result: ${rawScore}/${maxScore}] ${feedbackParts}`,
      },
      durationSec: a.timetaken || 60,
      createdAt: a.created_at || '2026-10-21T15:00:00.000Z',
    });
  }
}

console.log(`Built ${attempts.length} Mock 45C baseline attempts with full scores and audio.`);

// Read and update apeuniScrapedBank.js
const current = fs.readFileSync(dataFilePath, 'utf8');
const regex = /export const APEUNI_MOCK_45C_ATTEMPTS = \[[\s\S]*?\];\n\nexport const APEUNI_MOCK_44B_ATTEMPTS/;

if (!regex.test(current)) {
  console.error('Could not find APEUNI_MOCK_45C_ATTEMPTS anchor in apeuniScrapedBank.js');
  process.exit(1);
}

const replacement = `export const APEUNI_MOCK_45C_ATTEMPTS = ${JSON.stringify(attempts, null, 2)};\n\nexport const APEUNI_MOCK_44B_ATTEMPTS`;
const updated = current.replace(regex, replacement);

fs.writeFileSync(dataFilePath, updated);
console.log('Successfully rehydrated APEUNI_MOCK_45C_ATTEMPTS in apeuniScrapedBank.js!');
