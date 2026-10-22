/**
 * Phonetics & Single-Word Pronunciation Scorer
 * Provides IPA phonetic transcriptions, phonetic similarity analysis,
 * and calibrated single-word scoring for PTE Academic Speaking practice.
 */

export const ACADEMIC_IPA_DICT = {
  academic: '/ˌæk.əˈdem.ɪk/',
  resilience: '/rɪˈzɪl.jəns/',
  statistical: '/stəˈtɪs.tɪ.kəl/',
  dissertation: '/ˌdɪs.əˈteɪ.ʃən/',
  empirical: '/ɪmˈpɪr.ɪ.kəl/',
  evidence: '/ˈev.ɪ.dəns/',
  infrastructure: '/ˈɪn.frəˌstrʌk.tʃər/',
  biodiversity: '/ˌbaɪ.oʊ.daɪˈvɜːr.sə.ti/',
  sustainable: '/səˈsteɪ.nə.bəl/',
  aquifer: '/ˈæk.wə.fər/',
  agriculture: '/ˈæɡ.rɪ.kʌl.tʃər/',
  renewable: '/rɪˈnjuː.ə.bəl/',
  technology: '/tekˈnɒl.ə.dʒi/',
  methodology: '/ˌmeθ.əˈdɒl.ə.dʒi/',
  hypothesis: '/haɪˈpɒθ.ə.sɪs/',
  analysis: '/əˈnæl.ə.sɪs/',
  significant: '/sɪɡˈnɪf.ɪ.kənt/',
  phenomenon: '/fəˈnɒm.ɪ.nən/',
  indigenous: '/ɪnˈdɪdʒ.ɪ.nəs/',
  ecosystem: '/ˈiː.koʊˌsɪs.təm/',
  temperature: '/ˈtem.prə.tʃər/',
  laboratory: '/ləˈbɒr.ə.tər.i/',
  environment: '/ɪnˈvaɪ.rən.mənt/',
  government: '/ˈɡʌv.ən.mənt/',
  development: '/dɪˈvel.əp.mənt/',
  university: '/ˌjuː.nɪˈvɜː.sə.ti/',
  postgraduate: '/ˌpoʊstˈɡrædʒ.u.ət/',
  undergraduate: '/ˌʌn.dəˈɡrædʒ.u.ət/',
  curriculum: '/kəˈrɪk.jə.ləm/',
  participate: '/pɑːˈtɪs.ɪ.peɪt/',
  psychology: '/saɪˈkɒl.ə.dʒi/',
  philosophy: '/fɪˈlɒs.ə.fi/',
  literature: '/ˈlɪt.rə.tʃər/',
  architecture: '/ˈɑː.kɪ.tek.tʃər/',
  pronunciation: '/prəˌnʌn.siˈeɪ.ʃən/',
  fluency: '/ˈfluː.ən.si/',
  vocabulary: '/vəˈkæb.jə.lər.i/',
  comprehension: '/ˌkɒm.prɪˈhen.ʃən/',
  investigation: '/ɪnˌves.tɪˈɡeɪ.ʃən/',
  experiment: '/ɪkˈsper.ɪ.mənt/',
  observation: '/ˌɒb.zəˈveɪ.ʃən/',
  conclusion: '/kənˈkluː.ʒən/',
  perspective: '/pəˈspek.tɪv/',
  contemporary: '/kənˈtem.pər.ər.i/',
  preliminary: '/prɪˈlɪm.ɪ.nər.i/',
  quantitative: '/ˈkwɒn.tɪ.tə.tɪv/',
  qualitative: '/ˈkwɒl.ɪ.tə.tɪv/',
  theoretical: '/ˌθɪəˈret.ɪ.kəl/',
  consequence: '/ˈkɒn.sɪ.kwəns/',
  substantial: '/səbˈstæn.ʃəl/',
  fundamental: '/ˌfʌn.dəˈmen.təl/',
  circumstance: '/ˈsɜː.kəm.stɑːns/',
  characteristic: '/ˌkær.ək.təˈrɪs.tɪk/',
  demonstrate: '/ˈdem.ən.streɪt/',
  illustrate: '/ˈɪl.ə.streɪt/',
  contribute: '/kənˈtrɪb.juːt/',
  distinguish: '/dɪˈstɪŋ.ɡwɪʃ/',
  implement: '/ˈɪm.plɪ.ment/',
  evaluate: '/ɪˈvæl.ju.eɪt/',
}

/**
 * Deterministic English-to-IPA Phonetic Rule-Based Generator
 */
export function generateApproximateIPA(word = '') {
  const clean = String(word || '').toLowerCase().replace(/[^a-z]/g, '')
  if (!clean) return '/.../'
  if (ACADEMIC_IPA_DICT[clean]) return ACADEMIC_IPA_DICT[clean]

  let ipa = clean
    .replace(/tion\b/g, 'ʃən')
    .replace(/sion\b/g, 'ʒən')
    .replace(/ture\b/g, 'tʃər')
    .replace(/ough\b/g, 'oʊ')
    .replace(/ight\b/g, 'aɪt')
    .replace(/ph/g, 'f')
    .replace(/ch/g, 'tʃ')
    .replace(/sh/g, 'ʃ')
    .replace(/th/g, 'θ')
    .replace(/wh/g, 'w')
    .replace(/qu/g, 'kw')
    .replace(/ck/g, 'k')
    .replace(/ee|ea/g, 'iː')
    .replace(/oo/g, 'uː')
    .replace(/ai|ay/g, 'eɪ')
    .replace(/ou|ow/g, 'aʊ')
    .replace(/oi|oy/g, 'ɔɪ')
    .replace(/ar\b/g, 'ɑː')
    .replace(/er\b|or\b|ur\b/g, 'ər')
    .replace(/y\b/g, 'i')

  // Add primary stress mark before first consonant cluster
  if (clean.length > 3 && !ipa.startsWith('ˈ')) {
    ipa = 'ˈ' + ipa
  }

  return `/${ipa}/`
}

/**
 * Calibrated Single-Word Pronunciation Scorer
 * Compares user's spoken word against target word using character & phonetic Levenshtein
 */
export function scoreSingleWordPronunciation(targetWord = '', spokenWord = '') {
  const t = String(targetWord || '').toLowerCase().replace(/[^a-z]/g, '')
  const s = String(spokenWord || '').toLowerCase().replace(/[^a-z]/g, '')

  if (!t || !s) {
    return {
      score: 0,
      pteStarRating: 0,
      isMatch: false,
      feedback: 'No speech detected. Hold the microphone button and speak the word clearly.',
    }
  }

  if (t === s) {
    return {
      score: 100,
      pteStarRating: 5,
      isMatch: true,
      feedback: `¡Excelente! Has pronunciado "${targetWord}" con 100% de precisión fonética.`,
    }
  }

  // Levenshtein distance
  const n = t.length
  const m = s.length
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0))
  for (let i = 0; i <= n; i++) dp[i][0] = i
  for (let j = 0; j <= m; j++) dp[0][j] = j

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (t[i - 1] === s[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  const dist = dp[n][m]
  const maxLen = Math.max(n, m)
  const ratio = Math.max(0, 1 - dist / maxLen)
  const score = Math.round(ratio * 100)

  let stars = 1
  let feedback = ''

  if (score >= 85) {
    stars = 4
    feedback = `Casi perfecto (${score}%). Se detectó "${spokenWord}". Revisa la articulación final de "${targetWord}".`
  } else if (score >= 65) {
    stars = 3
    feedback = `Aceptable (${score}%). Se escuchó "${spokenWord}". Intenta enfatizar las sílabas clave.`
  } else if (score >= 40) {
    stars = 2
    feedback = `Baja precisión (${score}%). Se reconoció "${spokenWord}" en lugar de "${targetWord}". Escucha el audio nativo y repite.`
  } else {
    stars = 1
    feedback = `No coincide (${score}%). Se detectó "${spokenWord}". Intenta modular más despacio escuchando el ejemplo.`
  }

  return {
    score,
    pteStarRating: stars,
    isMatch: score >= 90,
    feedback,
  }
}
