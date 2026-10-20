/**
 * Curated Australian English YouTube Listening Lab Bank
 * All video IDs are verified playableInEmbed=true on YouTube:
 * 1. 1b5SpVOjy_0 — NEO English with Pam: "Pronunciation | Speak Naturally - Australian"
 * 2. LQqKasJ4Jx4 — Mondly by Pearson: "Australian Slang 🇦🇺"
 * 3. y7SwNsMUrhY — ABC News In-depth: "How long will Australia's housing downturn last? | 7.30"
 * 4. S8vgUPcDWfM — Behind the News (ABC Australia): "Generation Restoration, World Environment Day"
 * 5. twt0Dg-pKcI — CSIRO: "CSIRO Energise - understanding Australian energy use"
 */

export const INITIAL_AUSSIE_VIDEOS = [
  {
    id: 'yt_aus_accent_01',
    youtubeId: '1b5SpVOjy_0',
    title: 'Pronunciation: Speak Naturally in Australian English',
    channel: 'NEO English with Pam (Australian Coaching)',
    accentRegion: 'General Australian (Melbourne / Sydney)',
    topic: 'Australian Phonetics, Vowels & Connected Speech',
    difficulty: 'C1',
    segments: [
      {
        id: 'seg_1',
        startSec: 10,
        endSec: 26,
        transcript: 'Australian English is non-rhotic, which means we drop the R sound at the end of words like car, water, and Melbourne.',
        phoneticNote: 'Non-rhoticity: "car" -> /kɑː/, "water" -> /ˈwɔː.tə/ (flapped T + schwa ending), "Melbourne" -> /ˈmel.bən/.',
      },
      {
        id: 'seg_2',
        startSec: 35,
        endSec: 52,
        transcript: 'Notice how Australian speakers link words smoothly across vowel boundaries during fast academic lectures.',
        phoneticNote: 'Intrusive /r/ and linking /r/ connect vowels smoothly without glottal stops.',
      },
      {
        id: 'seg_3',
        startSec: 65,
        endSec: 82,
        transcript: 'Whether you are preparing for university seminars or workplace meetings, listening for stress timing is essential.',
        phoneticNote: 'Content words carry primary stress while function words reduce to weak schwa /ə/ forms.',
      },
    ],
    comprehensionQuestions: [
      {
        question: 'What does it mean that Australian English is "non-rhotic"?',
        options: [
          'The /r/ sound is pronounced only before a vowel and dropped at the end of syllables.',
          'Every vowel is pronounced with a rising question intonation.',
          'Consonants at the beginning of words are omitted.',
          'Words borrowed from British English are spelled phonetically.',
        ],
        correctIndex: 0,
        explanation: 'In non-rhotic varieties like General Australian, post-vocalic /r/ (as in "car" or "water") is not pronounced unless followed by a vowel.',
      },
      {
        question: 'How is the city name "Melbourne" typically pronounced by locals?',
        options: [
          '/ˈmel.bɔːrn/ with a strong rhotic "born"',
          '/ˈmel.bən/ with an unstressed schwa in the second syllable',
          '/ˈmæl.burn/ with a short flat A',
          '/ˈmɪl.bɜːn/ with a long stressed final syllable',
        ],
        correctIndex: 1,
        explanation: 'Australians reduce the second syllable of Melbourne to a quick schwa: /ˈmel.bən/.',
      },
    ],
    vocabulary: [
      {
        word: 'Non-rhotic',
        phoneticAu: '/nɒn ˈrəʊ.tɪk/',
        category: 'Aussie Phonetics',
        topic: 'Australian Accent',
        meaningEn: 'An English accent in which /r/ is not pronounced after vowels (e.g., "teacher" ends in /ə/).',
        australianContext: 'All three Australian accent varieties (Broad, General, Cultivated) are non-rhotic.',
        exampleSentence: 'Understanding non-rhotic linking helps PTE candidates catch fast Write From Dictation sentences.',
        synonyms: ['R-dropping'],
        collocations: ['non-rhotic dialect', 'linking R'],
      },
      {
        word: 'Connected speech',
        phoneticAu: '/kəˈnek.tɪd spiːtʃ/',
        category: 'Aussie Phonetics',
        topic: 'Listening Fluency',
        meaningEn: 'Continuous spoken language where words link together and unstressed vowels reduce to schwa.',
        australianContext: 'Crucial for decoding PTE Repeat Sentence and Summarize Spoken Text.',
        exampleSentence: 'Mastering Australian connected speech makes fast university lectures effortless to follow.',
        synonyms: ['elision and liaison'],
        collocations: ['natural connected speech'],
      },
    ],
  },
  {
    id: 'yt_pearson_slang_02',
    youtubeId: 'LQqKasJ4Jx4',
    title: 'Essential Australian Slang & Everyday Expressions Explained',
    channel: 'Mondly by Pearson',
    accentRegion: 'General Australian',
    topic: 'Australian Slang, Diminutives & Everyday Idioms',
    difficulty: 'B2/C1',
    segments: [
      {
        id: 'seg_s1',
        startSec: 8,
        endSec: 22,
        transcript: 'Australians love shortening long words and adding an O or IE vowel sound at the end, like arvo and brekkie.',
        phoneticNote: 'Hypocoristics (clipping + -o/-ie suffix) are a hallmark of everyday Australian English.',
      },
      {
        id: 'seg_s2',
        startSec: 28,
        endSec: 44,
        transcript: 'When someone says no worries mate, it means everything is sorted and there is no problem at all.',
        phoneticNote: 'Notice the diphthong in "mate" (/mæɪt/) which starts with a more open vowel in Australian English.',
      },
    ],
    comprehensionQuestions: [
      {
        question: 'How do Australians typically form casual diminutives like "arvo" (afternoon) and "brekkie" (breakfast)?',
        options: [
          'By clipping the word to its first syllable and adding -o, -ie, or -za.',
          'By translating the word into Latin.',
          'By doubling the final consonant.',
          'By speaking in a whisper.',
        ],
        correctIndex: 0,
        explanation: 'Australian English frequently clips multisyllabic nouns and adds suffixes like -o (arvo, servo) or -ie (brekkie, barbie).',
      },
    ],
    vocabulary: [
      {
        word: 'Arvo',
        phoneticAu: '/ˈɑː.vəʊ/',
        category: 'Aussie Slang',
        topic: 'Australian Everyday Speech',
        meaningEn: 'Afternoon (quintessential Australian clipping with -o suffix).',
        australianContext: 'Used universally in casual Australian workplaces and campus conversations.',
        exampleSentence: 'Let’s catch up this arvo in the library to review our laboratory data.',
        synonyms: ['afternoon'],
        collocations: ['this arvo', 'Sunday arvo'],
      },
      {
        word: 'Brekkie',
        phoneticAu: '/ˈbrek.i/',
        category: 'Aussie Slang',
        topic: 'Australian Everyday Speech',
        meaningEn: 'Breakfast.',
        australianContext: 'Common across cafés in Melbourne, Sydney, and Brisbane.',
        exampleSentence: 'We grabbed a quick brekkie near the campus tram stop before our morning lecture.',
        synonyms: ['breakfast'],
        collocations: ['grab brekkie', 'brekkie roll'],
      },
    ],
  },
  {
    id: 'yt_abc_housing_03',
    youtubeId: 'y7SwNsMUrhY',
    title: 'ABC News 7.30: Australia’s Housing Market, Interest Rates & Urban Supply',
    channel: 'ABC News In-depth (Australia)',
    accentRegion: 'Cultivated / General Australian (Sydney)',
    topic: 'Urban Planning & Macroeconomics',
    difficulty: 'C2',
    segments: [
      {
        id: 'seg_201',
        startSec: 15,
        endSec: 32,
        transcript: 'Medium-density housing around suburban rail corridors offers the most sustainable blueprint for growing Australian cities.',
        phoneticNote: 'Listen to the diphthong shift in "rail" (/ræɪl/) and the crisp reduction in "sustainable" (/səˈstæɪ.nə.bəl/).',
      },
      {
        id: 'seg_202',
        startSec: 42,
        endSec: 58,
        transcript: 'Without coordinated investment in public transit and green spaces, outer suburban sprawl strains municipal budgets.',
        phoneticNote: '"Suburban sprawl" and "municipal budgets" are high-frequency PTE Summarize Spoken Text collocations.',
      },
    ],
    comprehensionQuestions: [
      {
        question: 'According to the broadcast, where should new medium-density housing be prioritized?',
        options: [
          'In remote agricultural floodplains far from rail lines',
          'Around existing suburban railway and transit corridors',
          'Exclusively inside national parks',
          'Only in industrial port districts',
        ],
        correctIndex: 1,
        explanation: 'Transit-oriented development around suburban rail stations maximizes existing infrastructure efficiency.',
      },
    ],
    vocabulary: [
      {
        word: 'Urban sprawl',
        phoneticAu: '/ˈɜː.bən sprɔːl/',
        category: 'PTE Academic',
        topic: 'Urban Planning',
        meaningEn: 'The unrestricted expansion of low-density housing and roads across a large geographic area.',
        australianContext: 'A central debate in Sydney, Melbourne, and Brisbane metropolitan planning.',
        exampleSentence: 'Curbing outer urban sprawl is essential for preserving peri-urban agricultural land.',
        synonyms: ['suburban expansion', 'conurbation'],
        collocations: ['curb urban sprawl', 'unchecked sprawl'],
      },
      {
        word: 'Hard yakka',
        phoneticAu: '/hɑːd ˈjæk.ə/',
        category: 'Aussie Idiom',
        topic: 'Australian Workplace',
        meaningEn: 'Strenuous, demanding physical or intellectual work (derived from Jagera Indigenous language "yaga").',
        australianContext: 'Frequently heard in Australian journalism, engineering sites, and everyday speech.',
        exampleSentence: 'Rebuilding regional infrastructure after the floods required months of hard yakka.',
        synonyms: ['grueling labor', 'strenuous effort'],
        collocations: ['put in the hard yakka'],
      },
    ],
  },
  {
    id: 'yt_csiro_energy_04',
    youtubeId: 'twt0Dg-pKcI',
    title: 'CSIRO Energise: Understanding Australian Renewable Energy & Household Demand',
    channel: 'CSIRO Australian Science',
    accentRegion: 'General Australian (Canberra / Brisbane)',
    topic: 'Environmental Science & Clean Tech',
    difficulty: 'C1',
    segments: [
      {
        id: 'seg_301',
        startSec: 10,
        endSec: 25,
        transcript: 'Researchers at CSIRO collect real-time household energy data to improve solar grid stability across Australia.',
        phoneticNote: '"Australia" -> /əˈstræɪ.li.ə/; notice the reduced initial schwa and clear academic articulation.',
      },
      {
        id: 'seg_302',
        startSec: 32,
        endSec: 48,
        transcript: 'Integrating solar microgrids with community battery storage ensures reliable power during peak evening demand.',
        phoneticNote: '"Peak evening demand" is a classic PTE Retell Lecture and Write From Dictation noun phrase.',
      },
    ],
    comprehensionQuestions: [
      {
        question: 'What is the primary goal of the CSIRO Energise research initiative?',
        options: [
          'Understanding household energy patterns to plan a smarter, renewable electricity grid',
          'Replacing all rooftop solar panels with diesel generators',
          'Banning air conditioning during summer months',
          'Closing university engineering laboratories',
        ],
        correctIndex: 0,
        explanation: 'CSIRO Energise analyzes real household electricity consumption and solar generation to optimize Australia’s energy transition.',
      },
    ],
    vocabulary: [
      {
        word: 'Peak demand',
        phoneticAu: '/piːk dɪˈmɑːnd/',
        category: 'PTE Academic',
        topic: 'Energy & Economics',
        meaningEn: 'The period in which electrical power or public transit is expected to be provided at a significantly higher level than average.',
        australianContext: 'Notice the long bath vowel /ɑː/ in "demand" (/dɪˈmɑːnd/) common in Australian English.',
        exampleSentence: 'Grid-scale battery storage helps smooth out electricity prices during summer evening peak demand.',
        synonyms: ['maximum load'],
        collocations: ['peak demand period', 'offset peak demand'],
      },
    ],
  },
  {
    id: 'yt_btn_restoration_05',
    youtubeId: 'S8vgUPcDWfM',
    title: 'ABC Behind the News: Ecosystem Restoration & Australian Biodiversity',
    channel: 'Behind the News (ABC Australia)',
    accentRegion: 'General Australian (Adelaide)',
    topic: 'Ecology & Conservation',
    difficulty: 'C1',
    segments: [
      {
        id: 'seg_501',
        startSec: 12,
        endSec: 28,
        transcript: 'Restoring coastal mangroves and native bushland corridors protects threatened Australian marsupials from habitat loss.',
        phoneticNote: 'Clear Adelaide General Australian pronunciation with smooth vowel transitions.',
      },
    ],
    comprehensionQuestions: [
      {
        question: 'Why are native bushland corridors critical for Australian wildlife?',
        options: [
          'They connect fragmented habitats so native species can forage and breed safely',
          'They increase suburban highway speeds',
          'They prevent rainfall in coastal cities',
          'They replace marine sanctuaries',
        ],
        correctIndex: 0,
        explanation: 'Wildlife corridors reconnect isolated pockets of bushland, preserving genetic diversity in native marsupials and birds.',
      },
    ],
    vocabulary: [
      {
        word: 'Biodiversity hotspot',
        phoneticAu: '/ˌbɑɪ.əʊ.dɑɪˈvɜː.sə.ti ˈhɒt.spɒt/',
        category: 'PTE Collocation',
        topic: 'Ecology & Environment',
        meaningEn: 'A biogeographic region with significant levels of unique species that is threatened by human habitation.',
        australianContext: 'High-value collocation for PTE Read Aloud, Retell Lecture, and Write Essay.',
        exampleSentence: 'South-west Western Australia is internationally recognized as a global biodiversity hotspot.',
        synonyms: ['ecological sanctuary'],
        collocations: ['preserve biodiversity hotspots'],
      },
    ],
  },
]
