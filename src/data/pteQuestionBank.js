/**
 * Official-Spec Original PTE Academic Question Bank & Mock Exam Blueprints
 * Covers all 20 PTE Academic task types across Speaking, Writing, Reading, and Listening.
 */

export const INITIAL_PTE_QUESTIONS = [
  // ==================== SPEAKING ====================
  {
    id: 'ra_01',
    taskType: 'RA',
    section: 'speaking',
    title: 'Great Barrier Reef Coral Thermal Resilience',
    difficulty: 'C1',
    promptText:
      'Marine biologists at James Cook University have discovered that certain coral species across the northern Great Barrier Reef possess genetic adaptations that enhance thermal tolerance. By selectively breeding these resilient colonies in controlled coastal nurseries, researchers aim to accelerate reef restoration before oceanic heatwaves become too frequent.',
    source: 'built_in',
  },
  {
    id: 'ra_02',
    taskType: 'RA',
    section: 'speaking',
    title: 'Australian Monetary Policy and Housing Supply',
    difficulty: 'C2',
    promptText:
      'Structural imbalances between metropolitan population growth and residential construction capacity have complicated monetary policy transmission in Australia. Economists argue that reforming municipal zoning regulations and expanding prefabricated timber infrastructure are far more effective long-term remedies than relying solely on interest rate adjustments.',
    source: 'built_in',
  },
  {
    id: 'rs_01',
    taskType: 'RS',
    section: 'speaking',
    title: 'University Library Research Database',
    difficulty: 'C1',
    promptText: 'Listen to the sentence and repeat it verbatim.',
    audioScript: 'Postgraduate students must submit their ethics approval forms before commencing any fieldwork.',
    source: 'built_in',
  },
  {
    id: 'rs_02',
    taskType: 'RS',
    section: 'speaking',
    title: 'Renewable Grid Battery Storage',
    difficulty: 'C2',
    promptText: 'Listen to the sentence and repeat it verbatim.',
    audioScript: 'Grid-scale battery installations across South Australia have significantly stabilized wholesale electricity prices.',
    source: 'built_in',
  },
  {
    id: 'di_01',
    taskType: 'DI',
    section: 'speaking',
    title: 'Renewable Energy Share Across Australian States (2020–2026)',
    difficulty: 'C1',
    promptText: 'Look at the chart below. In 25 seconds, please speak into the microphone and describe in detail what the chart is showing. You will have 40 seconds to give your response.',
    keywords: ['Tasmania', 'South Australia', 'highest', 'renewable', 'percentage', 'increase', 'trend'],
    chartData: {
      type: 'bar',
      title: 'Renewable Electricity Generation Share by State (%)',
      unit: '%',
      series: [
        { label: 'Tasmania', value: 99, color: '#10b981' },
        { label: 'South Australia', value: 75, color: '#34d399' },
        { label: 'Victoria', value: 44, color: '#f59e0b' },
        { label: 'New South Wales', value: 38, color: '#3b82f6' },
        { label: 'Queensland', value: 31, color: '#8b5cf6' },
      ],
    },
    source: 'built_in',
  },
  {
    id: 'di_02',
    taskType: 'DI',
    section: 'speaking',
    title: 'International Student Enrolments by Field of Study',
    difficulty: 'C1',
    promptText: 'Look at the chart below. Study the distribution for 25 seconds and describe the highest, lowest, and notable comparisons in 40 seconds.',
    keywords: ['Engineering', 'Information Technology', 'Healthcare', 'Management', 'proportion', 'majority'],
    chartData: {
      type: 'bar',
      title: 'Australian University Enrolments by Discipline (Thousands)',
      unit: 'k',
      series: [
        { label: 'IT & Data Science', value: 142, color: '#3b82f6' },
        { label: 'Management & Commerce', value: 128, color: '#f59e0b' },
        { label: 'Nursing & Allied Health', value: 96, color: '#10b981' },
        { label: 'Civil & Mining Eng.', value: 78, color: '#ec4899' },
        { label: 'Environmental Science', value: 41, color: '#6366f1' },
      ],
    },
    source: 'built_in',
  },
  {
    id: 'rl_01',
    taskType: 'RL',
    section: 'speaking',
    title: 'Indigenous Fire Management & Cultural Burning',
    difficulty: 'C1',
    promptText: 'Listen to the lecture on Australian Indigenous fire management and retell the main findings in 40 seconds.',
    audioScript:
      'For tens of thousands of years, Aboriginal Australians have practiced cultural burning, also known as cool burning, to manage savanna and forest ecosystems. Unlike catastrophic summer bushfires that consume the forest canopy, cultural burns are conducted during the cooler early dry season. These low-intensity fires create a mosaic of burned and unburned patches, reducing dry fuel loads on the forest floor while preserving native seed banks and small marsupial habitats. Contemporary ecological studies in northern Australia confirm that integrating Indigenous fire stewardship with satellite monitoring reduces greenhouse gas emissions by over forty percent.',
    keywords: ['cultural burning', 'low-intensity', 'canopy', 'fuel loads', 'marsupial habitats', 'emissions'],
    source: 'built_in',
  },
  {
    id: 'sgd_01',
    taskType: 'SGD',
    section: 'speaking',
    title: 'Campus Autonomous Shuttle Bus Proposal',
    difficulty: 'C1',
    promptText: 'Listen to three university committee members discussing a proposed autonomous electric shuttle on campus. Summarize the different viewpoints in 40 seconds.',
    audioScript:
      'Speaker A (Transport Director): Introducing autonomous electric shuttles between the train station and the engineering precinct will cut commuter wait times in half and eliminate diesel emissions. Speaker B (Student Union Rep): Students support sustainability, but safety around pedestrian crossings during peak lecture hours is a major concern, and night-time lighting needs upgrading first. Speaker C (Finance Officer): Rather than purchasing six vehicles outright, we should run a twelve-month pilot with two leased shuttles to validate maintenance costs.',
    keywords: ['autonomous shuttles', 'emissions', 'pedestrian safety', 'pilot', 'maintenance costs'],
    source: 'built_in',
  },
  {
    id: 'rts_01',
    taskType: 'RTS',
    section: 'speaking',
    title: 'Requesting a Laboratory Extension from Tutor',
    difficulty: 'C1',
    promptText:
      'You are working on a group biochemistry lab report due this Friday, but the spectrometer in the university lab was offline for maintenance for two days. Explain the situation to your lab coordinator and propose a reasonable forty-eight-hour extension.',
    audioScript:
      'You are working on a group biochemistry lab report due this Friday, but the spectrometer in the university lab was offline for maintenance for two days. Explain the situation to your lab coordinator and propose a reasonable forty-eight-hour extension.',
    keywords: ['spectrometer', 'maintenance', 'biochemistry', 'forty-eight-hour', 'extension', 'data analysis'],
    source: 'built_in',
  },
  {
    id: 'asq_01',
    taskType: 'ASQ',
    section: 'speaking',
    title: 'Scientific Study of Weather and Climate',
    difficulty: 'B2',
    promptText: 'Listen to the short question and answer in one or two words.',
    audioScript: 'What is the scientific term for the study of atmospheric weather patterns and forecasting?',
    acceptedAnswers: ['meteorology', 'climatology'],
    source: 'built_in',
  },
  {
    id: 'asq_02',
    taskType: 'ASQ',
    section: 'speaking',
    title: 'Bibliography Location in an Academic Book',
    difficulty: 'B2',
    promptText: 'Listen to the short question and answer in one or two words.',
    audioScript: 'Where in an academic textbook would you find an alphabetical list of topics and their page numbers?',
    acceptedAnswers: ['index', 'the index'],
    source: 'built_in',
  },

  // ==================== WRITING ====================
  {
    id: 'swt_01',
    taskType: 'SWT',
    section: 'writing',
    title: 'Urban Sponge Cities and Stormwater Harvesting',
    difficulty: 'C1',
    promptText:
      'As Australian metropolitan centers experience both prolonged droughts and sudden flash flooding, urban hydrologists are advocating for the transformation of concrete suburbs into "sponge cities." Traditional urban drainage networks are engineered to channel rainwater rapidly into coastal outlets, which simultaneously wastes millions of megaliters of freshwater and erodes downstream riverbanks. By contrast, sponge city infrastructure replaces impermeable asphalt with porous pavements, bioswales, and sunken wetland parks that absorb, filter, and store stormwater in underground aquifers. During scorching summer months, this harvested water sustains urban tree canopies, lowering street-level temperatures by up to four degrees Celsius and significantly reducing residential air-conditioning demand.',
    keywords: ['sponge cities', 'stormwater', 'porous', 'aquifers', 'tree canopies', 'temperatures'],
    source: 'built_in',
  },
  {
    id: 'we_01',
    taskType: 'WE',
    section: 'writing',
    title: 'Four-Day Workweek & Economic Productivity',
    difficulty: 'C1',
    promptText:
      'Many organizations in Australia and worldwide are trialing a four-day workweek without reducing employee salaries. To what extent do you agree that shortening the standard working week improves both economic productivity and societal well-being? Support your argument with specific examples (200–300 words).',
    keywords: ['productivity', 'burnout', 'retention', 'automation', 'work-life balance', 'flexibility'],
    source: 'built_in',
  },

  // ==================== READING ====================
  {
    id: 'rwfib_01',
    taskType: 'RWFIB',
    section: 'reading',
    title: 'Square Kilometre Array Radio Telescope in Western Australia',
    difficulty: 'C1',
    promptText:
      'Located in the remote Murchison region of Western Australia, the Square Kilometre Array represents an unprecedented international {{b1}} in observational astrophysics. Because the desert site is shielded from commercial radio {{b2}}, its thousands of dipole antennas can detect faint hydrogen signals {{b3}} from the earliest epoch of cosmic dawn. Processing this immense data stream requires supercomputing architectures capable of filtering background noise with extraordinary {{b4}}.',
    blanks: [
      {
        id: 'b1',
        answer: 'collaboration',
        options: ['collaboration', 'speculation', 'fragmentation', 'hesitation'],
      },
      {
        id: 'b2',
        answer: 'interference',
        options: ['interference', 'eloquence', 'complacency', 'abundance'],
      },
      {
        id: 'b3',
        answer: 'emanating',
        options: ['emanating', 'hesitating', 'Fabricating', 'mitigating'],
      },
      {
        id: 'b4',
        answer: 'precision',
        options: ['precision', 'ambiguity', 'redundancy', 'reluctance'],
      },
    ],
    source: 'built_in',
  },
  {
    id: 'mcma_r_01',
    taskType: 'MCMA_R',
    section: 'reading',
    title: 'Desalination Plants in Australian Coastal Cities',
    difficulty: 'C1',
    promptText:
      'Reverse-osmosis desalination plants now operate as rainfall-independent water insurance policies for Sydney, Melbourne, Perth, Adelaide, and the Gold Coast. While critics initially questioned the capital expenditure and electricity intensity of forcing seawater through semi-permeable membranes, modern facilities are contractually linked to dedicated wind and solar farms. Furthermore, during La Niña years when dam reservoirs are near capacity, plants can enter low-energy standby mode while still guaranteeing municipal supply security should a multi-year El Niño drought return.\n\nWhich of the following statements are supported by the passage? (Select all that apply)',
    options: [
      { id: 'A', text: 'Desalination provides a water source that does not depend on seasonal rainfall.' },
      { id: 'B', text: 'Australian desalination plants have completely replaced traditional dam reservoirs.' },
      { id: 'C', text: 'Modern desalination facilities offset their energy requirements using renewable power.' },
      { id: 'D', text: 'Facilities can scale down operations during periods of high dam storage.' },
      { id: 'E', text: 'Reverse-osmosis membranes require zero maintenance during El Niño droughts.' },
    ],
    correctOptions: ['A', 'C', 'D'],
    source: 'built_in',
  },
  {
    id: 'rop_01',
    taskType: 'ROP',
    section: 'reading',
    title: 'Evolution of the Platypus Genome',
    difficulty: 'C1',
    paragraphs: [
      {
        id: 'p1',
        text: 'When European naturalists first examined a preserved platypus specimen in 1799, many suspected the creature was an elaborate taxidermy hoax combining a duck, a beaver, and an otter.',
      },
      {
        id: 'p2',
        text: 'More than two centuries later, whole-genome sequencing revealed that this amphibious monotreme genuinely bridges the evolutionary divide between reptiles, birds, and mammals.',
      },
      {
        id: 'p3',
        text: 'Specifically, while the platypus retains reptilian egg-laying genes, it also possesses mammalian casein genes that allow females to produce nutrient-rich milk for their hatchlings.',
      },
      {
        id: 'p4',
        text: 'These antimicrobial milk proteins are now being investigated by Australian biochemists as novel weapons against antibiotic-resistant superbugs.',
      },
    ],
    correctOrder: ['p1', 'p2', 'p3', 'p4'],
    source: 'built_in',
  },
  {
    id: 'rfib_01',
    taskType: 'RFIB',
    section: 'reading',
    title: 'Microbial Soil Carbon Sequestration',
    difficulty: 'C1',
    promptText:
      'Regenerative graziers across New South Wales are adopting rotational grazing to {{b1}} atmospheric carbon in depleted pasture soils. By allowing perennial native grasses sufficient {{b2}} periods between grazing cycles, deep root systems exude sugars that nourish subterranean mycorrhizal {{b3}}. This symbiotic exchange transforms volatile organic matter into stable humus, simultaneously boosting drought {{b4}} and farm productivity.',
    blanks: [
      { id: 'b1', answer: 'sequester' },
      { id: 'b2', answer: 'recovery' },
      { id: 'b3', answer: 'fungi' },
      { id: 'b4', answer: 'resilience' },
    ],
    wordBank: ['sequester', 'recovery', 'fungi', 'resilience', 'evaporate', 'stagnation', 'erosion'],
    source: 'built_in',
  },
  {
    id: 'mcsa_r_01',
    taskType: 'MCSA_R',
    section: 'reading',
    title: 'Algorithmic Transparency in Healthcare Diagnostics',
    difficulty: 'C1',
    promptText:
      'Although deep neural networks frequently outperform senior radiologists in detecting early-stage retinal lesions, clinical adoption remains cautious when models operate as inscrutable "black boxes." Clinicians are legally and ethically accountable for diagnostic decisions; consequently, explainable artificial intelligence (XAI) frameworks that highlight the exact pixel regions driving a prediction have become indispensable for regulatory approval.\n\nWhat is the author’s primary argument regarding AI in medical diagnostics?',
    options: [
      { id: 'A', text: 'Radiologists should be replaced by neural networks to reduce hospital costs.' },
      { id: 'B', text: 'Interpretability of AI predictions is essential for clinical trust and regulatory adoption.' },
      { id: 'C', text: 'Retinal lesion detection cannot be automated using current computer vision.' },
      { id: 'D', text: 'Explainable AI reduces the accuracy of deep neural networks.' },
    ],
    correctOption: 'B',
    explanation: 'The passage emphasizes that clinicians need explainable AI (XAI) to understand how predictions are made before adopting them.',
    source: 'built_in',
  },

  // ==================== LISTENING ====================
  {
    id: 'sst_01',
    taskType: 'SST',
    section: 'listening',
    title: 'Circular Economy in Lithium Battery Recycling',
    difficulty: 'C1',
    promptText: 'Listen to the lecture and write a summary of 50 to 70 words.',
    audioScript:
      'Australia is the world’s largest producer of raw lithium spodumene, yet historically less than ten percent of end-of-life lithium-ion batteries were recycled domestically. Today, hydrometallurgical engineers in Perth and Melbourne are commercializing closed-loop recovery processes that extract ninety-five percent of battery-grade lithium, nickel, and cobalt using non-toxic organic acids rather than high-emission smelting furnaces. Establishing local battery recycling refineries not only prevents hazardous landfill fires but also insulates domestic renewable storage supply chains from geopolitical mineral shortages.',
    keywords: ['lithium', 'hydrometallurgical', 'recycling', 'cobalt', 'closed-loop', 'supply chains'],
    source: 'built_in',
  },
  {
    id: 'mcma_l_01',
    taskType: 'MCMA_L',
    section: 'listening',
    title: 'Urban Heat Island Mitigation in Western Sydney',
    difficulty: 'C1',
    promptText: 'Listen to the urban planning briefing and select all measures recommended by the speaker.',
    audioScript:
      'During summer heatwaves, Western Sydney suburbs can record temperatures eight degrees higher than coastal suburbs due to dark roofing tiles and sparse street canopy cover. Our municipal cooling strategy mandates light-colored reflective roofing on all new residential developments, increases neighbourhood tree canopy targets to forty percent, and introduces misting shelters along pedestrian transit corridors.',
    options: [
      { id: 'A', text: 'Mandating reflective, light-colored roofs on new housing.' },
      { id: 'B', text: 'Expanding street tree canopy coverage to forty percent.' },
      { id: 'C', text: 'Banning all private motor vehicles from Western Sydney.' },
      { id: 'D', text: 'Installing cooling mist shelters along pedestrian walkways.' },
    ],
    correctOptions: ['A', 'B', 'D'],
    source: 'built_in',
  },
  {
    id: 'lfib_01',
    taskType: 'LFIB',
    section: 'listening',
    title: 'Antarctic Ice Core Paleoclimate Records',
    difficulty: 'C1',
    audioScript:
      'By drilling three kilometers into the East Antarctic ice sheet, glaciologists have extracted continuous atmospheric samples spanning over one million years. Microscopic air bubbles trapped within the compressed glacial layers preserve a direct chemical archive of ancient carbon dioxide fluctuations.',
    promptText:
      'By drilling three kilometers into the East Antarctic ice sheet, glaciologists have {{b1}} continuous atmospheric samples spanning over one million years. Microscopic air {{b2}} trapped within the compressed glacial layers preserve a direct chemical {{b3}} of ancient carbon dioxide {{b4}}.',
    blanks: [
      { id: 'b1', answer: 'extracted' },
      { id: 'b2', answer: 'bubbles' },
      { id: 'b3', answer: 'archive' },
      { id: 'b4', answer: 'fluctuations' },
    ],
    source: 'built_in',
  },
  {
    id: 'hcs_01',
    taskType: 'HCS',
    section: 'listening',
    title: 'Bilingualism and Executive Cognitive Control',
    difficulty: 'C1',
    promptText: 'Listen to the recording and choose the paragraph that best summarizes the speaker’s points.',
    audioScript:
      'Neuroimaging research demonstrates that lifelong bilinguals constantly activate both languages in the brain, requiring the dorsolateral prefrontal cortex to selectively inhibit the non-target language. Over decades, this continuous cognitive workout strengthens executive attention networks and delays the clinical onset of age-related dementia symptoms by an average of four to five years compared with monolingual peers.',
    options: [
      {
        id: 'A',
        text: 'Bilingual individuals only activate one language at a time, which reduces mental fatigue in the prefrontal cortex.',
      },
      {
        id: 'B',
        text: 'Managing two active languages exercises executive brain networks and significantly delays the onset of dementia symptoms.',
      },
      {
        id: 'C',
        text: 'Learning a second language cures all forms of neurological disease in elderly patients.',
      },
      {
        id: 'D',
        text: 'Monolingual speakers have stronger prefrontal cortex activation than bilingual speakers.',
      },
    ],
    correctOption: 'B',
    explanation: 'The speaker explains that inhibiting the non-target language strengthens executive control and delays dementia symptoms by 4–5 years.',
    source: 'built_in',
  },
  {
    id: 'mcsa_l_01',
    taskType: 'MCSA_L',
    section: 'listening',
    title: 'Marine Kelp Forest Restoration in Tasmania',
    difficulty: 'C1',
    promptText: 'What is the primary cause of giant kelp decline off the coast of Tasmania mentioned by the speaker?',
    audioScript:
      'Giant kelp forests along Tasmania’s eastern coastline have declined by over ninety percent in recent decades. The primary driver is the southward extension of the warm East Australian Current, which both deprives kelp of cold, nutrient-rich water and brings invasive long-spined sea urchins that overgraze the remaining reefs.',
    options: [
      { id: 'A', text: 'Commercial harvesting of kelp for agricultural fertilizer.' },
      { id: 'B', text: 'Warming ocean currents and overgrazing by invasive sea urchins.' },
      { id: 'C', text: 'Deep-sea volcanic activity in the Bass Strait.' },
      { id: 'D', text: 'Freshwater runoff from hydroelectric dams.' },
    ],
    correctOption: 'B',
    explanation: 'The speaker identifies the warm East Australian Current and invasive long-spined sea urchins as the primary cause.',
    source: 'built_in',
  },
  {
    id: 'smw_01',
    taskType: 'SMW',
    section: 'listening',
    title: 'Peer Review in Scientific Publishing',
    difficulty: 'C1',
    promptText: 'Listen to the lecture on scientific publishing. The final words have been replaced by a beep. Select the most logical completion.',
    audioScript:
      'Double-blind peer review is designed to prevent institutional bias by concealing the identities of both the reviewers and the submitting [BEEP]',
    options: [
      { id: 'A', text: 'authors' },
      { id: 'B', text: 'librarians' },
      { id: 'C', text: 'accountants' },
      { id: 'D', text: 'passengers' },
    ],
    correctOption: 'A',
    explanation: 'In double-blind peer review, both the reviewers and the submitting authors remain anonymous.',
    source: 'built_in',
  },
  {
    id: 'hiw_01',
    taskType: 'HIW',
    section: 'listening',
    title: 'Agrivoltaics: Combining Solar Panels and Sheep Grazing',
    difficulty: 'C1',
    audioScript:
      'Across regional Victoria, solar farm operators are partnering with merino wool graziers to practice agrivoltaics. Elevated photovoltaic panels provide afternoon shade that reduces heat stress in livestock and retains soil moisture, while grazing sheep naturally control tall weeds without chemical herbicides.',
    displayWords: [
      'Across', 'regional', 'Victoria,', 'solar', 'farm', 'operators', 'are', 'partnering', 'with',
      'merino', 'wool', 'graziers', 'to', 'practice', 'agrivoltaics.', 'Elevated', 'photovoltaic',
      'panels', 'provide', 'afternoon', 'glare', 'that', 'reduces', 'heat', 'stress', 'in',
      'livestock', 'and', 'depletes', 'soil', 'moisture,', 'while', 'grazing', 'sheep', 'naturally',
      'accelerate', 'tall', 'weeds', 'without', 'chemical', 'fertilizers.'
    ],
    // Indices of replaced words: 20 ('glare' instead of 'shade'), 28 ('depletes' instead of 'retains'), 35 ('accelerate' instead of 'control'), 40 ('fertilizers.' instead of 'herbicides.')
    incorrectIndices: [20, 28, 35, 40],
    source: 'built_in',
  },
  {
    id: 'wfd_01',
    taskType: 'WFD',
    section: 'listening',
    title: 'Academic Integrity & Source Citation',
    difficulty: 'C1',
    promptText: 'Listen carefully and type the exact sentence.',
    audioScript: 'All statistical claims in your dissertation must be supported by empirical evidence.',
    source: 'built_in',
  },
  {
    id: 'wfd_02',
    taskType: 'WFD',
    section: 'listening',
    title: 'Interdisciplinary Climate Research',
    difficulty: 'C2',
    promptText: 'Listen carefully and type the exact sentence.',
    audioScript: 'Addressing complex environmental challenges requires close collaboration across multiple scientific disciplines.',
    source: 'built_in',
  },
]

export const MOCK_TEST_BLUEPRINTS = [
  {
    id: 'mock_full_01',
    title: 'PTE Academic Full Scored Mock Exam #1 (2-Hour Format)',
    mode: 'full',
    durationMinutes: 60,
    description:
      'Complete cross-module simulation covering Speaking & Writing, Reading, and Listening with full 10–90 Communicative & Enabling Skills report.',
    itemIds: [
      'ra_01', 'rs_01', 'di_01', 'rl_01', 'sgd_01', 'rts_01', 'asq_01',
      'swt_01', 'we_01',
      'rwfib_01', 'mcma_r_01', 'rop_01', 'rfib_01', 'mcsa_r_01',
      'sst_01', 'mcma_l_01', 'lfib_01', 'hcs_01', 'hiw_01', 'wfd_01', 'wfd_02'
    ],
  },
  {
    id: 'mock_high_weight_79',
    title: '79+ Superior English Big-4 Booster Mock (RA, RS, RWFIB, WFD)',
    mode: 'booster',
    durationMinutes: 25,
    description:
      'Targets the 4 highest-weighted cross-skill tasks in Pearson’s scoring matrix (Read Aloud, Repeat Sentence, R&W Fill in the Blanks, and Write From Dictation).',
    itemIds: ['ra_01', 'ra_02', 'rs_01', 'rs_02', 'rwfib_01', 'hiw_01', 'wfd_01', 'wfd_02'],
  },
  {
    id: 'mock_speaking_writing',
    title: 'Part 1 Mini-Mock: Speaking & Writing',
    mode: 'section',
    durationMinutes: 30,
    description: 'Timed simulation of Read Aloud, Repeat Sentence, Describe Image, Retell Lecture, Group Discussion, SWT, and Essay.',
    itemIds: ['ra_01', 'rs_01', 'di_01', 'rl_01', 'sgd_01', 'rts_01', 'swt_01', 'we_01'],
  },
  {
    id: 'mock_reading_listening',
    title: 'Parts 2 & 3 Mini-Mock: Reading & Listening',
    mode: 'section',
    durationMinutes: 30,
    description: 'Timed simulation of RWFIB, Re-order Paragraphs, RFIB, SST, LFIB, HIW, and Write From Dictation.',
    itemIds: ['rwfib_01', 'rop_01', 'rfib_01', 'sst_01', 'lfib_01', 'hiw_01', 'wfd_01'],
  },
]
