/**
 * Curated Australian English YouTube Listening Lab Bank
 * Featured Channels:
 * - Josh's Farming Moments (@JoshsFarmingMoments — Australian Dairy Farming)
 * - The Once A Day Farmer (@theonceadayfarmer — Down Under Dairy & Pastoral Farming)
 * Authentic Regional & Broad/General Australian English (Dairy Farming, Irrigation, Pastures & Rural Economics)
 * Plus Australian News, Science & Phonetics (ABC News, CSIRO, NEO English).
 * All video IDs are verified playableInEmbed=true on YouTube.
 */

export const INITIAL_AUSSIE_VIDEOS = [
  {
    id: 'yt_josh_milking_01',
    youtubeId: 'OgVW3qQwCoA',
    title: 'Morning Milking 230 Cows Through Our New Dairy || Australian Dairy Farming',
    channel: "Josh's Farming Moments",
    accentRegion: 'Broad / General Regional Australian (Victoria)',
    topic: 'Australian Dairy Farming, Automated Cup Removers & Milk Pricing',
    difficulty: 'C1/C2',
    segments: [
      {
        id: 'seg_josh_809',
        startSec: 809,
        endSec: 835,
        transcript:
          'We run two hundred and thirty cows through the new dairy shed each morning, and the automatic cup removers save a massive amount of time in the pit.',
        phoneticNote:
          'Regional Aussie connected speech: "two hundred and thirty" -> /tuː ˈhʌn.drəd ən ˈθɜː.ɾi/ (flapped T in thirty, dropped /d/ in "and"), non-rhotic "remover" /rɪˈmuː.və/.',
      },
      {
        id: 'seg_josh_120',
        startSec: 120,
        endSec: 145,
        transcript:
          'From bringing the herd up the lane to setting up the vat and washing down the yard, every step in the morning routine has to run smoothly.',
        phoneticNote:
          'Notice the Australian vowel shift in "lane" (/læɪn/) and "yard" (/jɑːd/ — long open front-central vowel without /r/).',
      },
      {
        id: 'seg_josh_1180',
        startSec: 1180,
        endSec: 1208,
        transcript:
          'Milk processors in our region pay based on milk solids, including butterfat and protein percentages, as well as strict quality benchmarks.',
        phoneticNote:
          'High-value PTE Listening & Retell Lecture agricultural economics terminology spoken at natural Australian pace.',
      },
    ],
    comprehensionQuestions: [
      {
        question:
          'What is the main advantage of installing automatic cup removers (ACRs) in the new dairy shed?',
        options: [
          'They prevent over-milking and significantly reduce physical labor in the pit while managing 230 cows.',
          'They eliminate the need to bring cows in from the paddock.',
          'They automatically pasteurize and bottle the milk on-site.',
          'They replace pasture grazing with indoor hydroponics.',
        ],
        correctIndex: 0,
        explanation:
          'Automatic cup removers detect when milk flow drops and detach the cluster automatically, saving labor and protecting udder health.',
      },
      {
        question:
          'How are Australian dairy farmers typically paid by regional milk processors?',
        options: [
          'Solely by the number of paddocks on the property',
          'Based on milk solids (kilograms of butterfat and protein) and milk quality standards',
          'A fixed annual government stipend regardless of output',
          'By the weight of hay harvested in winter',
        ],
        correctIndex: 1,
        explanation:
          'Australian dairy processors price farmgate milk primarily on milk solids (fat + protein) and somatic cell count / hygiene metrics.',
      },
    ],
    vocabulary: [
      {
        word: 'Dairy shed (Herringbone / Rotary)',
        phoneticAu: '/ˈdeə.ri ʃed/',
        category: 'Aussie Rural & Ag',
        topic: 'Australian Dairy Farming',
        meaningEn:
          'The farm building and parlor pit where dairy cows are brought twice daily for milking.',
        australianContext:
          'In Australia and New Zealand, farmers almost always say "the dairy" or "the dairy shed" rather than "milking barn".',
        exampleSentence:
          'Upgrading the old dairy shed allowed Josh to milk two hundred and thirty cows comfortably on his own.',
        synonyms: ['milking parlor', 'bails'],
        collocations: ['new dairy shed', 'wash down the dairy'],
      },
      {
        word: 'Automatic cup remover (ACR)',
        phoneticAu: '/ˌɔː.təˈmæt.ɪk kʌp rɪˈmuː.və/',
        category: 'Agricultural Tech',
        topic: 'Dairy Automation',
        meaningEn:
          'A sensor-driven pneumatic system that shuts off vacuum and removes milking clusters when a cow finishes milking.',
        australianContext:
          'Essential labor-saving technology on family-operated Australian dairy farms.',
        exampleSentence:
          'Automatic cup removers ensure consistent milking times and prevent teat damage across the herd.',
        synonyms: ['auto take-offs'],
        collocations: ['install automatic cup removers'],
      },
      {
        word: 'Paddock',
        phoneticAu: '/ˈpæd.ək/',
        category: 'Aussie Vocabulary',
        topic: 'Australian Farming',
        meaningEn:
          'Any fenced field or grazing enclosure of any size used for pasture or crops.',
        australianContext:
          'In Australia, "field" or "meadow" is rarely used; every fenced agricultural plot—even 100 hectares—is called a paddock.',
        exampleSentence:
          'After morning milking, the cows are drafted out to a fresh ryegrass paddock.',
        synonyms: ['pasture', 'grazing field'],
        collocations: ['back paddock', 'rotational paddock grazing'],
      },
    ],
  },
  {
    id: 'yt_josh_dairy_cost_02',
    youtubeId: '3gzy4olRr4c',
    title: 'How Much We Spent to Build a Dairy? || Australian Farm Breakdown',
    channel: "Josh's Farming Moments",
    accentRegion: 'Broad / General Regional Australian (Victoria)',
    topic: 'Agricultural Capital Expenditure, Construction & Farm Economics',
    difficulty: 'C1',
    segments: [
      {
        id: 'seg_cost_1',
        startSec: 95,
        endSec: 122,
        transcript:
          'Building a modern dairy from scratch involves massive upfront capital for concrete yards, steelwork, vacuum pumps, and milk cooling vats.',
        phoneticNote:
          'Listen to the Australian diphthongs in "modern" (/ˈmɒd.ən/) and "yards" (/jɑːdz/), plus rapid listing intonation.',
      },
      {
        id: 'seg_cost_2',
        startSec: 540,
        endSec: 568,
        transcript:
          'When you factor in earthworks, plumbing, and electrical installation, the budget can blow out quickly if you do not do some of the labour yourself.',
        phoneticNote:
          '"Blow out" (exceed budget significantly) is a high-frequency Australian news and business phrasal verb.',
      },
    ],
    comprehensionQuestions: [
      {
        question:
          'What does the Australian expression "the budget can blow out" mean in this video?',
        options: [
          'Total project costs can escalate and exceed initial estimates rapidly',
          'Strong winds can damage the roof of the shed',
          'The bank cancels the loan entirely',
          'Electricity bills drop to zero in summer',
        ],
        correctIndex: 0,
        explanation:
          'In Australian English, a "budget blowout" or costs "blowing out" means expenses rising far beyond planned figures.',
      },
    ],
    vocabulary: [
      {
        word: 'Budget blowout',
        phoneticAu: '/ˈbʌdʒ.ɪt ˈbləʊ.æʊt/',
        category: 'Aussie Idiom & Business',
        topic: 'Finance & Project Management',
        meaningEn:
          'A major cost overrun where actual expenditure significantly exceeds the planned budget.',
        australianContext:
          'Used constantly in Australian ABC news, infrastructure debates, and farm business discussions.',
        exampleSentence:
          'Doing the fencing and pipework ourselves helped prevent a major budget blowout on the new dairy.',
        synonyms: ['cost overrun', 'cost escalation'],
        collocations: ['avoid a budget blowout', 'infrastructure blowout'],
      },
    ],
  },
  {
    id: 'yt_josh_irrigation_03',
    youtubeId: 'T5O5HdPiKrY',
    title: 'Our Biggest Irrigation Project Revealed || Water Management in Australia',
    channel: "Josh's Farming Moments",
    accentRegion: 'Broad / General Regional Australian (Victoria)',
    topic: 'Water Infrastructure, Pasture Irrigation & Drought Resilience',
    difficulty: 'C1',
    segments: [
      {
        id: 'seg_irr_1',
        startSec: 110,
        endSec: 138,
        transcript:
          'Upgrading our irrigation layout lets us water pastures much more efficiently and grow high quality feed right through the dry Australian summer.',
        phoneticNote:
          'Notice "water" pronounced /ˈwɔː.ɾə/ with a flapped intervocalic /t/ and non-rhotic schwa ending.',
      },
      {
        id: 'seg_irr_2',
        startSec: 480,
        endSec: 508,
        transcript:
          'Laying high pressure underground mainline pipe takes plenty of preparation, trenching, and careful pressure testing before backfilling.',
        phoneticNote:
          'Clear consonant clusters in technical farming terms ("underground mainline", "backfilling").',
      },
    ],
    comprehensionQuestions: [
      {
        question:
          'Why is upgrading irrigation infrastructure so important for Australian dairy farms?',
        options: [
          'It maximizes water efficiency and guarantees consistent pasture growth during hot, dry summer months',
          'It replaces the need for fertilizers in winter',
          'It prevents cows from walking on concrete lanes',
          'It reduces the size of the milk vat required',
        ],
        correctIndex: 0,
        explanation:
          'Reliable pasture irrigation allows Australian dairy farmers to grow their own high-energy forage rather than buying expensive imported grain.',
      },
    ],
    vocabulary: [
      {
        word: 'Water allocation',
        phoneticAu: '/ˈwɔː.tə ˌæl.əˈkæɪ.ʃən/',
        category: 'PTE Academic & Ag',
        topic: 'Water Resources',
        meaningEn:
          'The specific volume of irrigation water a farmer is legally entitled to extract from a river system or irrigation district in a season.',
        australianContext:
          'A critical economic and environmental topic across the Murray-Darling Basin and Victorian irrigation districts.',
        exampleSentence:
          'Efficient pipeline irrigation helps farmers make the most of their seasonal water allocation.',
        synonyms: ['water entitlement', 'irrigation quota'],
        collocations: ['seasonal water allocation'],
      },
    ],
  },
  {
    id: 'yt_josh_crops_04',
    youtubeId: 'SNCDiKeCpnU',
    title: 'Summer Crops & Pastures Sown || Rotational Grazing & Soil Moisture',
    channel: "Josh's Farming Moments",
    accentRegion: 'Broad / General Regional Australian (Victoria)',
    topic: 'Agronomy, Pasture Renovation & Livestock Nutrition',
    difficulty: 'C1',
    segments: [
      {
        id: 'seg_crop_1',
        startSec: 85,
        endSec: 112,
        transcript:
          'Getting our summer forage crops and perennial pastures sown on time is critical while we still have good moisture in the topsoil.',
        phoneticNote:
          'Notice the smooth linking between "sown on time" (/səʊn ɒn tɑɪm/) and the Australian diphthong in "time".',
      },
      {
        id: 'seg_crop_2',
        startSec: 620,
        endSec: 648,
        transcript:
          'Once the seed germinates and establishes a strong root system, these paddocks will provide high protein grazing for the milking herd.',
        phoneticNote:
          'Great practice for PTE Repeat Sentence and Retell Lecture biology/agriculture vocabulary.',
      },
    ],
    comprehensionQuestions: [
      {
        question:
          'Why is timing critical when sowing summer crops and pastures on an Australian farm?',
        options: [
          'Seeds need adequate topsoil moisture and warm soil temperatures to germinate before summer heat arrives',
          'Tractors can only operate during winter nights',
          'Pasture seeds must be harvested within 48 hours of planting',
          'Irrigation channels are permanently closed in spring',
        ],
        correctIndex: 0,
        explanation:
          'Sowing while spring soil moisture is still present ensures strong germination and root establishment prior to peak summer evaporation.',
      },
    ],
    vocabulary: [
      {
        word: 'Forage crop',
        phoneticAu: '/ˈfɒr.ɪdʒ krɒp/',
        category: 'PTE Academic',
        topic: 'Agriculture & Ecology',
        meaningEn:
          'Plant material (mainly leaves and stems) grown specifically to be grazed by livestock or harvested as silage.',
        australianContext:
          'Commonly includes chicory, millet, brassicas, and lucerne on Australian dairy farms.',
        exampleSentence:
          'Sowing drought-tolerant summer forage crops reduces reliance on purchased supplementary feed.',
        synonyms: ['fodder crop', 'pasture herbage'],
        collocations: ['high-yield forage crop'],
      },
    ],
  },
  {
    id: 'yt_josh_upgrade_05',
    youtubeId: 'BbgbTsaqJeY',
    title: 'Dairy Upgrade 2 Years in the Making || Farm Infrastructure & Drafting',
    channel: "Josh's Farming Moments",
    accentRegion: 'Broad / General Regional Australian (Victoria)',
    topic: 'Livestock Handling, Automated Drafting & Farm Engineering',
    difficulty: 'C1',
    segments: [
      {
        id: 'seg_upg_1',
        startSec: 70,
        endSec: 98,
        transcript:
          'This dairy upgrade has been two years in the making, and seeing the cow flow improve so dramatically makes all the hard yakka worth it.',
        phoneticNote:
          'Authentic rural Australian delivery: "cow flow" (/kæʊ fləʊ/) features the distinct Australian /æʊ/ diphthong in "cow".',
      },
      {
        id: 'seg_upg_2',
        startSec: 410,
        endSec: 438,
        transcript:
          'Improving yard design reduces stress on the cattle and makes drafting individual cows for vet checks effortless.',
        phoneticNote:
          '"Drafting cows" is the standard Australian and New Zealand term for sorting or separating livestock through gates.',
      },
    ],
    comprehensionQuestions: [
      {
        question: 'In Australian farming terminology, what does "drafting cows" mean?',
        options: [
          'Sorting and separating specific animals from the main herd using gates',
          'Drawing a sketch of the farm layout on paper',
          'Transporting milk tankers to the factory',
          'Measuring rainfall in the paddock',
        ],
        correctIndex: 0,
        explanation:
          'In Australia and New Zealand, "drafting" means separating individual sheep or cattle into different yards or pens.',
      },
    ],
    vocabulary: [
      {
        word: 'Drafting (livestock)',
        phoneticAu: '/ˈdrɑːf.tɪŋ/',
        category: 'Aussie Rural Term',
        topic: 'Livestock Management',
        meaningEn:
          'Selecting and separating individual animals from a herd or mob into a separate yard via drafting gates.',
        australianContext:
          'Notice the long /ɑː/ vowel in "drafting" (/ˈdrɑːf.tɪŋ/) in Australian English.',
        exampleSentence:
          'Automated drafting gates read each cow’s ear tag and sort her into the holding pen after milking.',
        synonyms: ['sorting livestock', 'cutting out'],
        collocations: ['drafting gate', 'drafting race'],
      },
    ],
  },
  {
    id: 'yt_josh_tractor_06',
    youtubeId: 'bGXibMNz0_Y',
    title: 'Bought My Dream Tractor || Upgrading Our Australian Farm Machinery',
    channel: "Josh's Farming Moments",
    accentRegion: 'Broad / General Regional Australian (Victoria)',
    topic: 'Agricultural Machinery, Feeding Out & Paddock Work',
    difficulty: 'B2/C1',
    segments: [
      {
        id: 'seg_trac_1',
        startSec: 60,
        endSec: 88,
        transcript:
          'Having a reliable tractor with a front end loader is essential when you are carting silage bales and renovating paddocks every week.',
        phoneticNote:
          'Notice "carting" (/ˈkɑː.ɾɪŋ/ — transporting/hauling on a farm) and "bales" (/bæɪlz/).',
      },
    ],
    comprehensionQuestions: [
      {
        question:
          'What does the Australian farming verb "carting" (e.g., "carting silage or hay") mean?',
        options: [
          'Hauling and transporting heavy loads of feed or materials across the farm with a tractor or truck',
          'Selling farm machinery at an auction',
          'Repairing a punctured tractor tire',
          'Planting trees along a boundary fence',
        ],
        correctIndex: 0,
        explanation:
          'Aussie farmers regularly say "carting hay", "carting silage", or "carting gravel" to mean transporting loads.',
      },
    ],
    vocabulary: [
      {
        word: 'Silage',
        phoneticAu: '/ˈsɑɪ.lɪdʒ/',
        category: 'Agricultural Vocab',
        topic: 'Livestock Feed',
        meaningEn:
          'Fermented, high-moisture pasture grass or maize stored in wrapped bales or pits to feed cattle.',
        australianContext:
          'Harvested in spring when pasture growth exceeds what the herd can graze daily.',
        exampleSentence:
          'We wrapped two hundred bales of ryegrass silage to feed out during autumn.',
        synonyms: ['fermented fodder', 'haylage'],
        collocations: ['silage bales', 'feed out silage'],
      },
    ],
  },
  {
    id: 'yt_farmer_selling_01',
    youtubeId: 'HRDVHGuEgbA',
    title: 'Farms Are Selling Like Crazy! Is It Time? || The Once A Day Farmer',
    channel: 'The Once A Day Farmer',
    accentRegion: 'Broad / Regional Australasian (Rural Down Under Pasture Dialect)',
    topic: 'Rural Land Values, Heifer Insemination (AB), Cattle Weighing & Farmgate Economics',
    difficulty: 'C1/C2',
    segments: [
      {
        id: 'seg_farmer_ab_1',
        startSec: 15,
        endSec: 42,
        transcript:
          'It feels like it is all go at the moment with AB, and today we are heading down to inseminate the last of the heifers who can go out with the bull after this.',
        phoneticNote:
          'Down Under connected speech: "all go at the moment" -> /ɔːl ɡəʊ æt ðə ˈməʊ.mənt/; notice non-rhotic "heifers" /ˈhef.əz/ and centralized vowel in "bull" /bʊl/.',
      },
      {
        id: 'seg_farmer_weighing_2',
        startSec: 525,
        endSec: 555,
        transcript:
          'Monitoring pasture covers and weighing the young stock regularly gives us the exact growth rates we need before the dry summer sets in.',
        phoneticNote:
          'Regional pastoral terms: "pasture covers" /ˈpɑːs.tʃə ˈkʌv.əz/ with non-rhotic schwa, flapped /t/ in "rates", and reduced vowel in "before".',
      },
      {
        id: 'seg_farmer_market_3',
        startSec: 840,
        endSec: 872,
        transcript:
          'Dairy farms in the local area have been selling for really strong prices lately, which gets you thinking about equity, land valuation, and future plans.',
        phoneticNote:
          'Economic and real estate vocabulary spoken at rapid conversational rural cadence: "valuation" /ˌvæl.juˈæɪ.ʃən/ with fronted diphthong /æɪ/.',
      },
    ],
    comprehensionQuestions: [
      {
        question:
          'Why is completing the heifer artificial breeding (AB) program important for daily farm operations?',
        options: [
          'It frees up daily labor by allowing the heifers to run with the stock bull rather than requiring continuous monitoring for heats',
          'It forces the immediate sale of all milking cows',
          'It requires importing hay from North America',
          'It permanently shuts down the milking platform',
        ],
        correctIndex: 0,
        explanation:
          'Once artificial insemination rounds conclude, heifers are turned out with a bull, freeing the farmer from daily sorting and insemination duties.',
      },
      {
        question:
          'What market trend prompted the farmer to reflect on long-term dairy property decisions?',
        options: [
          'High transaction prices and strong demand for neighbouring dairy farms in the district',
          'A sudden drop in global milk solids values',
          'The complete loss of seasonal groundwater permits',
          'Severe winter flooding across the lower paddocks',
        ],
        correctIndex: 0,
        explanation:
          'Strong rural property sales in his local area highlighted rising capital equity and prompted reflection on farm succession and valuation.',
      },
    ],
    vocabulary: [
      {
        word: 'Heifer',
        phoneticAu: '/ˈhef.ə/',
        category: 'Livestock & Rural Vocabulary',
        topic: 'Pastoral Farming',
        meaningEn:
          'A young female cow that has not yet borne a calf, or has borne only one calf.',
        australianContext:
          'Fundamental pastoral term across Australia and New Zealand. Spoken with a non-rhotic schwa ending.',
        exampleSentence:
          'Weighed heifers must hit minimum target weights before joining the breeding herd.',
        synonyms: ['young cow', 'replacement heifer'],
        collocations: ['rising two-year-old heifer', 'heifer grazing'],
      },
      {
        word: 'AB (Artificial Breeding)',
        phoneticAu: '/ˌeɪ ˈbiː/',
        category: 'Agricultural Terminology',
        topic: 'Dairy Genetics',
        meaningEn:
          'The widespread practice of artificial insemination in livestock to improve herd genetics and timing of calving.',
        australianContext:
          'In Australia and NZ, farmers and genetics companies almost exclusively use the abbreviation "AB" rather than "AI".',
        exampleSentence:
          'The four-week AB period determines the peak calving dates for the following spring.',
        synonyms: ['artificial insemination', 'AI'],
        collocations: ['AB technician', 'synchronized AB program'],
      },
      {
        word: 'Pasture cover',
        phoneticAu: '/ˈpɑːs.tʃə ˈkʌv.ə/',
        category: 'Agronomy & Management',
        topic: 'Pasture Grazing',
        meaningEn:
          'The estimated total mass of edible dry matter grass available per hectare across a farm.',
        australianContext:
          'Central metric used by Australian and NZ rotational graziers to allocate daily paddock feed.',
        exampleSentence:
          'Measuring weekly pasture cover ensures cows receive enough dry matter before paddocks get overgrazed.',
        synonyms: ['grass cover', 'forage availability'],
        collocations: ['average farm pasture cover', 'pasture cover wedge'],
      },
      {
        word: 'Runoff block',
        phoneticAu: '/ˈrʌn.ɒf blɒk/',
        category: 'Rural Real Estate & Land',
        topic: 'Farm Topography',
        meaningEn:
          'A separate support farm or parcel of land used for wintering cows, grazing dry stock, or making silage away from the main milking dairy.',
        australianContext:
          'Crucial concept in Down Under dairy economics: separates high-value milking platform land from support grazing.',
        exampleSentence:
          'Heifers spend their first winter grazing on the dry runoff block before returning to the home farm.',
        synonyms: ['support block', 'out-farm'],
        collocations: ['lease a runoff block', 'dry stock runoff'],
      },
    ],
  },
  {
    id: 'yt_farmer_oad_02',
    youtubeId: '7JTgFz2wVwo',
    title: "I'm Going Back To OAD Milking || Once-A-Day vs Twice-A-Day & Herd Testing",
    channel: 'The Once A Day Farmer',
    accentRegion: 'Broad / Regional Australasian (Rural Down Under)',
    topic: 'Once-A-Day (OAD) Milking Strategy, Somatic Cell Counts (SCC) & Farm Labor Efficiency',
    difficulty: 'C1',
    segments: [
      {
        id: 'seg_oad_test_1',
        startSec: 10,
        endSec: 38,
        transcript:
          'This is our first herd test since finishing the shed upgrade, and we want to see how the cows are performing for milk volume and somatic cell count.',
        phoneticNote:
          'High-frequency Australian/NZ dairy terms: "shed upgrade" and "somatic cell count" (/səˈmæt.ɪk sel kæʊnt/).',
      },
      {
        id: 'seg_oad_lifestyle_2',
        startSec: 580,
        endSec: 610,
        transcript:
          'Switching back to once a day milking reduces cow walking distances, protects pasture lanes, and gives us tremendous lifestyle balance without sacrificing herd condition.',
        phoneticNote:
          'Notice non-rhotic "distances" and "condition", and the rapid reduction of "once a day" to /wʌns ə dæɪ/.',
      },
    ],
    comprehensionQuestions: [
      {
        question:
          'What are the main operational advantages of Once-A-Day (OAD) milking emphasized in this video?',
        options: [
          'Reduced cow walking fatigue, less track wear, and dramatically improved work-life balance for the farmer',
          'Doubling total dairy output within forty-eight hours',
          'Eliminating the need for milking machinery altogether',
          'Replacing pasture grass with grain-only diets',
        ],
        correctIndex: 0,
        explanation:
          'OAD milking minimizes physical wear on cows and tracks while eliminating afternoon milking sessions, giving farmers time for family and farm projects.',
      },
    ],
    vocabulary: [
      {
        word: 'OAD Milking (Once A Day)',
        phoneticAu: '/ˌwʌns ə ˈdæɪ ˈmɪl.kɪŋ/',
        category: 'Dairy Management',
        topic: 'Milking Systems',
        meaningEn:
          'The practice of milking the herd only once in every 24-hour cycle rather than the conventional twice daily (TAD).',
        australianContext:
          'A major trend in Australia and NZ to improve farm sustainability, animal welfare, and lifestyle.',
        exampleSentence:
          'Adopting full-season OAD milking allowed the family to run the dairy farm without outside hired labor.',
        synonyms: ['single milking system'],
        collocations: ['full-season OAD', 'transition to OAD'],
      },
      {
        word: 'Somatic Cell Count (SCC)',
        phoneticAu: '/səˈmæt.ɪk sel kæʊnt/',
        category: 'Quality Benchmarks',
        topic: 'Milk Science',
        meaningEn:
          'The number of white blood cells per millilitre of milk, serving as the international indicator of udder health and mastitis.',
        australianContext:
          'Milk companies pay significant quality premiums or impose financial penalties based on bulk tank SCC thresholds.',
        exampleSentence:
          'Regular herd testing identifies individual cows with high somatic cell count so they can be treated promptly.',
        synonyms: ['cell count', 'SCC'],
        collocations: ['low somatic cell count', 'bulk milk SCC penalty'],
      },
    ],
  },
  {
    id: 'yt_farmer_silage_03',
    youtubeId: 'b_ebsN8r7J8',
    title: 'The Irish Are Here! Spring Silage In New Zealand || Pasture Surplus & Baling',
    channel: 'The Once A Day Farmer',
    accentRegion: 'Broad / Regional Australasian (Rural Down Under)',
    topic: 'Spring Pasture Flush, Silage Conservation, Machinery Contractors & Seasonal Labor',
    difficulty: 'C1',
    segments: [
      {
        id: 'seg_silage_flush_1',
        startSec: 20,
        endSec: 48,
        transcript:
          'We have had a massive flush of spring pasture growth, so we have locked up the surplus paddocks to drop and bale for summer supplementary feed.',
        phoneticNote:
          '"Spring flush" is the rapid pasture surge in September–November in the Southern Hemisphere, spoken with open vowel /æ/ in "pasture".',
      },
      {
        id: 'seg_silage_baling_2',
        startSec: 485,
        endSec: 515,
        transcript:
          'The agricultural contractors arrived with the round baler and wrapper to wrap the silage while the dry matter percentage is optimal.',
        phoneticNote:
          'Australasian pronunciation of "baler" (/ˈbæɪ.lə/) and "contractor" (/kənˈtræk.tə/) with non-rhotic endings.',
      },
    ],
    comprehensionQuestions: [
      {
        question:
          'Why do pasture graziers "lock up" paddocks to make silage during the spring flush?',
        options: [
          'To harvest and conserve surplus grass that exceeds immediate herd appetite, preventing grass from becoming rank and woody',
          'To keep weeds from blowing onto neighbours properties',
          'To build residential housing on the pasture',
          'To let cows sleep in the sun without interruptions',
        ],
        correctIndex: 0,
        explanation:
          'Locking up paddocks removes them from the grazing round so they can grow to optimal cutting yield, conserving high-quality forage for summer dry spells.',
      },
    ],
    vocabulary: [
      {
        word: 'Spring flush',
        phoneticAu: '/sprɪŋ flʌʃ/',
        category: 'Seasonal Agronomy',
        topic: 'Pastoral Growth',
        meaningEn:
          'The period in early spring when warm soil temperatures and rainfall cause exceptionally fast grass and clover growth.',
        australianContext:
          'Critical period across Victorian and Australasian dairying when feed supply outstrips cow demand.',
        exampleSentence:
          'During the spring flush, farmers must mow and bale grass quickly to keep pastures sweet and leafy.',
        synonyms: ['spring growth peak'],
        collocations: ['manage the spring flush', 'surplus spring flush'],
      },
      {
        word: 'Silage bale',
        phoneticAu: '/ˈsaɪ.lɪdʒ bæɪl/',
        category: 'Forage Conservation',
        topic: 'Feed Storage',
        meaningEn:
          'A dense, round or square compressed bale of semi-wilted forage wrapped airtight in plastic film to undergo lactic acid fermentation.',
        australianContext:
          'Ubiquitous feed reserve seen on roadside paddocks across southern Australia and New Zealand.',
        exampleSentence:
          'Feeding out two silage bales per day kept the milking herd producing well during the January heatwave.',
        synonyms: ['wrapped bale', 'balage'],
        collocations: ['wrap silage bales', 'feed out silage'],
      },
    ],
  },
  {
    id: 'yt_farmer_airace_04',
    youtubeId: 'dKju_-DyhqA',
    title: 'Dad Gets To Use The New AI Race For The First Time || Sexed Semen & Cattle Handling',
    channel: 'The Once A Day Farmer',
    accentRegion: 'Broad / Regional Australasian (Rural Down Under)',
    topic: 'Livestock Facilities, Artificial Insemination Race, Sexed Semen Economics & Herd Genetics',
    difficulty: 'C1',
    segments: [
      {
        id: 'seg_airace_chute_1',
        startSec: 25,
        endSec: 52,
        transcript:
          'Getting the cows lined up in the new AI race makes breeding so much safer and smoother for both the handler and the stock.',
        phoneticNote:
          'Notice the word "race" (/ræɪs/) meaning a narrow chute or single-file laneway for livestock, unique to Australian & NZ farming.',
      },
      {
        id: 'seg_airace_genetics_2',
        startSec: 280,
        endSec: 310,
        transcript:
          'Using sexed semen on our top replacement heifers maximizes our heifer calf numbers while breeding the lower tier to beef bulls.',
        phoneticNote:
          'Genetic management terms: "replacement heifers", "sexed semen" (/sekst ˈsiː.mən/).',
      },
    ],
    comprehensionQuestions: [
      {
        question:
          'What is an "AI race" in Australian and New Zealand pastoral farming?',
        options: [
          'A narrow, single-file fenced handling chute designed to safely restrain cattle for breeding or veterinary checks',
          'A horse race held at rural agricultural shows',
          'A competitive speed-milking contest between local farmers',
          'An algorithm that calculates tractor fuel efficiency',
        ],
        correctIndex: 0,
        explanation:
          'A race is a narrow cattle alleyway where animals move in single file, allowing operators to work safely behind or alongside them.',
      },
    ],
    vocabulary: [
      {
        word: 'Cattle race',
        phoneticAu: '/ˈkæt.əl ræɪs/',
        category: 'Farm Infrastructure',
        topic: 'Livestock Handling',
        meaningEn:
          'A narrow, fenced passage or chute along which cattle move in single file to a drafting gate, crush, or milking pit.',
        australianContext:
          'Essential fixture in every Australian and NZ farm yard. In North America, often called an "alley" or "chute".',
        exampleSentence:
          'The farmer guided twenty cows into the cattle race to inspect their ear tags.',
        synonyms: ['chute', 'handling alley'],
        collocations: ['drafting race', 'concrete cattle race'],
      },
      {
        word: 'Sexed semen',
        phoneticAu: '/sekst ˈsiː.mən/',
        category: 'Biotechnology & Genetics',
        topic: 'Animal Breeding',
        meaningEn:
          'Bovine semen that has been sorted through flow cytometry to guarantee approximately 90% female offspring.',
        australianContext:
          'Standard tool on modern high-performing Australasian dairy farms to generate replacement cows efficiently.',
        exampleSentence:
          'Investing in sexed semen ensures high genetic merit heifer calves while minimizing unwanted bobby calves.',
        synonyms: ['gender-sorted semen'],
        collocations: ['inseminate with sexed semen', 'conception rate of sexed semen'],
      },
    ],
  },
  {
    id: 'yt_farmer_maize_05',
    youtubeId: 'uKjOtVv_t-4',
    title: 'First Time Using Cling Film On My Maize Stack...Has It Worked?? || Forage Preservation',
    channel: 'The Once A Day Farmer',
    accentRegion: 'Broad / Regional Australasian (Rural Down Under)',
    topic: 'Maize Silage Bunker Management, Oxygen Barrier Film & Feed Storage Preservation',
    difficulty: 'C1',
    segments: [
      {
        id: 'seg_maize_cling_1',
        startSec: 30,
        endSec: 58,
        transcript:
          'Sealing the maize silage stack with an oxygen barrier film prevents top layer spoilage and locks in high energy starch for winter feeding.',
        phoneticNote:
          'Agricultural vocabulary: "silage stack" (/ˈsaɪ.lɪdʒ stæk/), non-rhotic "barrier" and "layer".',
      },
    ],
    comprehensionQuestions: [
      {
        question:
          'Why is an oxygen barrier film used when packing a maize silage stack?',
        options: [
          'It adheres tightly to the forage, blocking oxygen penetration to eliminate top-layer mold and nutrient spoilage',
          'It makes the stack glow in the dark for night inspections',
          'It increases the moisture content to 95 percent',
          'It repels rainfall without requiring any weighted tyres',
        ],
        correctIndex: 0,
        explanation:
          'Oxygen barrier plastic clings to the crop surface, maintaining an anaerobic seal that stops fungal yeast and mold from spoiling the silage.',
      },
    ],
    vocabulary: [
      {
        word: 'Maize silage',
        phoneticAu: '/mæɪz ˈsaɪ.lɪdʒ/',
        category: 'Forage Crops & Nutrition',
        topic: 'Dairy Feeding',
        meaningEn:
          'Chopped whole-plant corn fermented in a bunker or pit to provide high-energy starch supplementation for ruminants.',
        australianContext:
          'Crucial supplementary feed in southern Australia and NZ when pasture protein is high but carbohydrates are limited.',
        exampleSentence:
          'Feeding maize silage alongside leafy spring clover balances rumen nitrogen and boosts milk solids.',
        synonyms: ['corn silage'],
        collocations: ['maize silage pit', 'harvest maize silage'],
      },
    ],
  },
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
        transcript:
          'Australian English is non-rhotic, which means we drop the R sound at the end of words like car, water, and Melbourne.',
        phoneticNote:
          'Non-rhoticity: "car" -> /kɑː/, "water" -> /ˈwɔː.tə/ (flapped T + schwa ending), "Melbourne" -> /ˈmel.bən/.',
      },
      {
        id: 'seg_2',
        startSec: 35,
        endSec: 52,
        transcript:
          'Notice how Australian speakers link words smoothly across vowel boundaries during fast academic lectures.',
        phoneticNote:
          'Intrusive /r/ and linking /r/ connect vowels smoothly without glottal stops.',
      },
      {
        id: 'seg_3',
        startSec: 65,
        endSec: 82,
        transcript:
          'Whether you are preparing for university seminars or workplace meetings, listening for stress timing is essential.',
        phoneticNote:
          'Content words carry primary stress while function words reduce to weak schwa /ə/ forms.',
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
        explanation:
          'In non-rhotic varieties like General Australian, post-vocalic /r/ (as in "car" or "water") is not pronounced unless followed by a vowel.',
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
        explanation:
          'Australians reduce the second syllable of Melbourne to a quick schwa: /ˈmel.bən/.',
      },
    ],
    vocabulary: [
      {
        word: 'Non-rhotic',
        phoneticAu: '/nɒn ˈrəʊ.tɪk/',
        category: 'Aussie Phonetics',
        topic: 'Australian Accent',
        meaningEn:
          'An English accent in which /r/ is not pronounced after vowels (e.g., "teacher" ends in /ə/).',
        australianContext:
          'All three Australian accent varieties (Broad, General, Cultivated) are non-rhotic.',
        exampleSentence:
          'Understanding non-rhotic linking helps PTE candidates catch fast Write From Dictation sentences.',
        synonyms: ['R-dropping'],
        collocations: ['non-rhotic dialect', 'linking R'],
      },
      {
        word: 'Connected speech',
        phoneticAu: '/kəˈnek.tɪd spiːtʃ/',
        category: 'Aussie Phonetics',
        topic: 'Listening Fluency',
        meaningEn:
          'Continuous spoken language where words link together and unstressed vowels reduce to schwa.',
        australianContext:
          'Crucial for decoding PTE Repeat Sentence and Summarize Spoken Text.',
        exampleSentence:
          'Mastering Australian connected speech makes fast university lectures effortless to follow.',
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
        transcript:
          'Australians love shortening long words and adding an O or IE vowel sound at the end, like arvo and brekkie.',
        phoneticNote:
          'Hypocoristics (clipping + -o/-ie suffix) are a hallmark of everyday Australian English.',
      },
      {
        id: 'seg_s2',
        startSec: 28,
        endSec: 44,
        transcript:
          'When someone says no worries mate, it means everything is sorted and there is no problem at all.',
        phoneticNote:
          'Notice the diphthong in "mate" (/mæɪt/) which starts with a more open vowel in Australian English.',
      },
    ],
    comprehensionQuestions: [
      {
        question:
          'How do Australians typically form casual diminutives like "arvo" (afternoon) and "brekkie" (breakfast)?',
        options: [
          'By clipping the word to its first syllable and adding -o, -ie, or -za.',
          'By translating the word into Latin.',
          'By doubling the final consonant.',
          'By speaking in a whisper.',
        ],
        correctIndex: 0,
        explanation:
          'Australian English frequently clips multisyllabic nouns and adds suffixes like -o (arvo, servo) or -ie (brekkie, barbie).',
      },
    ],
    vocabulary: [
      {
        word: 'Arvo',
        phoneticAu: '/ˈɑː.vəʊ/',
        category: 'Aussie Slang',
        topic: 'Australian Everyday Speech',
        meaningEn: 'Afternoon (quintessential Australian clipping with -o suffix).',
        australianContext:
          'Used universally in casual Australian workplaces and campus conversations.',
        exampleSentence:
          'Let’s catch up this arvo in the library to review our laboratory data.',
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
        exampleSentence:
          'We grabbed a quick brekkie near the campus tram stop before our morning lecture.',
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
        transcript:
          'Medium-density housing around suburban rail corridors offers the most sustainable blueprint for growing Australian cities.',
        phoneticNote:
          'Listen to the diphthong shift in "rail" (/ræɪl/) and the crisp reduction in "sustainable" (/səˈstæɪ.nə.bəl/).',
      },
      {
        id: 'seg_202',
        startSec: 42,
        endSec: 58,
        transcript:
          'Without coordinated investment in public transit and green spaces, outer suburban sprawl strains municipal budgets.',
        phoneticNote:
          '"Suburban sprawl" and "municipal budgets" are high-frequency PTE Summarize Spoken Text collocations.',
      },
    ],
    comprehensionQuestions: [
      {
        question:
          'According to the broadcast, where should new medium-density housing be prioritized?',
        options: [
          'In remote agricultural floodplains far from rail lines',
          'Around existing suburban railway and transit corridors',
          'Exclusively inside national parks',
          'Only in industrial port districts',
        ],
        correctIndex: 1,
        explanation:
          'Transit-oriented development around suburban rail stations maximizes existing infrastructure efficiency.',
      },
    ],
    vocabulary: [
      {
        word: 'Urban sprawl',
        phoneticAu: '/ˈɜː.bən sprɔːl/',
        category: 'PTE Academic',
        topic: 'Urban Planning',
        meaningEn:
          'The unrestricted expansion of low-density housing and roads across a large geographic area.',
        australianContext:
          'A central debate in Sydney, Melbourne, and Brisbane metropolitan planning.',
        exampleSentence:
          'Curbing outer urban sprawl is essential for preserving peri-urban agricultural land.',
        synonyms: ['suburban expansion', 'conurbation'],
        collocations: ['curb urban sprawl', 'unchecked sprawl'],
      },
      {
        word: 'Hard yakka',
        phoneticAu: '/hɑːd ˈjæk.ə/',
        category: 'Aussie Idiom',
        topic: 'Australian Workplace',
        meaningEn:
          'Strenuous, demanding physical or intellectual work (derived from Jagera Indigenous language "yaga").',
        australianContext:
          'Frequently heard in Australian journalism, engineering sites, and everyday speech.',
        exampleSentence:
          'Rebuilding regional infrastructure after the floods required months of hard yakka.',
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
        transcript:
          'Researchers at CSIRO collect real-time household energy data to improve solar grid stability across Australia.',
        phoneticNote:
          '"Australia" -> /əˈstræɪ.li.ə/; notice the reduced initial schwa and clear academic articulation.',
      },
      {
        id: 'seg_302',
        startSec: 32,
        endSec: 48,
        transcript:
          'Integrating solar microgrids with community battery storage ensures reliable power during peak evening demand.',
        phoneticNote:
          '"Peak evening demand" is a classic PTE Retell Lecture and Write From Dictation noun phrase.',
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
        explanation:
          'CSIRO Energise analyzes real household electricity consumption and solar generation to optimize Australia’s energy transition.',
      },
    ],
    vocabulary: [
      {
        word: 'Peak demand',
        phoneticAu: '/piːk dɪˈmɑːnd/',
        category: 'PTE Academic',
        topic: 'Energy & Economics',
        meaningEn:
          'The period in which electrical power or public transit is expected to be provided at a significantly higher level than average.',
        australianContext:
          'Notice the long bath vowel /ɑː/ in "demand" (/dɪˈmɑːnd/) common in Australian English.',
        exampleSentence:
          'Grid-scale battery storage helps smooth out electricity prices during summer evening peak demand.',
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
        transcript:
          'Restoring coastal mangroves and native bushland corridors protects threatened Australian marsupials from habitat loss.',
        phoneticNote:
          'Clear Adelaide General Australian pronunciation with smooth vowel transitions.',
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
        explanation:
          'Wildlife corridors reconnect isolated pockets of bushland, preserving genetic diversity in native marsupials and birds.',
      },
    ],
    vocabulary: [
      {
        word: 'Biodiversity hotspot',
        phoneticAu: '/ˌbɑɪ.əʊ.dɑɪˈvɜː.sə.ti ˈhɒt.spɒt/',
        category: 'PTE Collocation',
        topic: 'Ecology & Environment',
        meaningEn:
          'A biogeographic region with significant levels of unique species that is threatened by human habitation.',
        australianContext:
          'High-value collocation for PTE Read Aloud, Retell Lecture, and Write Essay.',
        exampleSentence:
          'South-west Western Australia is internationally recognized as a global biodiversity hotspot.',
        synonyms: ['ecological sanctuary'],
        collocations: ['preserve biodiversity hotspots'],
      },
    ],
  },
]
