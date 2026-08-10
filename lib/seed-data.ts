import { ExamCategory, ExamItem, BookItem, BundleItem } from './types';

export const INITIAL_CATEGORIES: ExamCategory[] = [
  {
    id: 'ssc',
    name: 'SSC',
    slug: 'ssc',
    seo_description: 'All SSC CGL, CHSL, MTS & GD Exam Preparation Materials',
    isActive: true,
    display_order: 1,
  },
  {
    id: 'banking',
    name: 'Banking',
    slug: 'banking',
    seo_description: 'SBI PO, IBPS PO, SBI Clerk & RRB Officer Exam Preparation',
    isActive: true,
    display_order: 2,
  },
  {
    id: 'teaching',
    name: 'Teaching',
    slug: 'teaching',
    seo_description: 'CTET, UP TET, KDS & State TET Recruitment Exams',
    isActive: true,
    display_order: 3,
  },
  {
    id: 'railways',
    name: 'Railways',
    slug: 'railways',
    seo_description: 'RRB NTPC, Group D, ALP & RPF Police Preparation',
    isActive: true,
    display_order: 4,
  },
  {
    id: 'defense',
    name: 'Defense',
    slug: 'defense',
    seo_description: 'NDA, CDS, AFCAT, CAPF & Army Recruitment Tests',
    isActive: true,
    display_order: 5,
  },
  {
    id: 'upsc',
    name: 'UPSC IAS',
    slug: 'upsc',
    seo_description: 'UPSC Civil Services Prelims, Mains & Optional Prep',
    isActive: true,
    display_order: 6,
  },
  {
    id: 'state_psc',
    name: 'State PSC',
    slug: 'state-psc',
    seo_description: 'BPSC, UPPSC, MPPSC, RAS & State PCS Exams',
    isActive: true,
    display_order: 7,
  },
  {
    id: 'police',
    name: 'Police & SI',
    slug: 'police',
    seo_description: 'Delhi Police, UP Police Constable & Sub Inspector Exams',
    isActive: true,
    display_order: 8,
  },
  {
    id: 'engineering',
    name: 'GATE & AE/JE',
    slug: 'engineering',
    seo_description: 'SSC JE, RRB JE, GATE & PSU Engineering Exams',
    isActive: true,
    display_order: 9,
  },
  {
    id: 'insurance',
    name: 'Insurance',
    slug: 'insurance',
    seo_description: 'LIC AAO, NIACL, OICL & GIC Assistant Exams',
    isActive: true,
    display_order: 10,
  },
  {
    id: 'law',
    name: 'Law & Judiciary',
    slug: 'law',
    seo_description: 'CLAT, Judicial Services & Law Officer Exams',
    isActive: true,
    display_order: 11,
  },
  {
    id: 'management',
    name: 'MBA & Management',
    slug: 'management',
    seo_description: 'CAT, XAT, MAT & Bank Management Trainee Exams',
    isActive: true,
    display_order: 12,
  },
];

export const INITIAL_EXAMS: ExamItem[] = [
  {
    id: 'exam_ssc_cgl_2024',
    title: 'SSC CGL 2024 Tier 1 Complete Batch',
    slug: 'ssc-cgl-2024-tier-1',
    seo_description: 'Full SSC CGL Tier 1 Mock Test Series with 150+ Video Classes and 50+ Full Mocks',
    full_description: 'Comprehensive test preparation series for SSC CGL 2024. Includes past 10 years solved papers, sectional tests, and live mentor video analysis.',
    category: 'SSC',
    tags: ['ssc', 'cgl', 'exam', 'test', 'tier-1'],
    isActive: true,
    buy_price: 499,
    list_price: 1999,
    cover: 'https://picsum.photos/seed/ssccgl/300/400',
    classes_count: 150,
    mocks_count: 50,
    previouspapers: [
      { title: 'SSC CGL 2023 Tier 1 Shift 1 Paper', url: '/tests/ssc-cgl-2023-s1', questionsCount: 100, timeMinutes: 60 },
      { title: 'SSC CGL 2023 Tier 1 Shift 2 Paper', url: '/tests/ssc-cgl-2023-s2', questionsCount: 100, timeMinutes: 60 },
      { title: 'SSC CGL 2022 Tier 1 Official Memory Test', url: '/tests/ssc-cgl-2022-mem', questionsCount: 100, timeMinutes: 60 }
    ],
    practicetests: [
      { title: 'Full Length Mock Test 1', url: '/tests/ssc-fl-1', questionsCount: 100, timeMinutes: 60 },
      { title: 'Full Length Mock Test 2', url: '/tests/ssc-fl-2', questionsCount: 100, timeMinutes: 60 },
      { title: 'Full Length Mock Test 3', url: '/tests/ssc-fl-3', questionsCount: 100, timeMinutes: 60 }
    ],
    sectional: [
      { title: 'Quantitative Aptitude Sectional Test', url: '/tests/ssc-sec-quant', questionsCount: 25, timeMinutes: 15 },
      { title: 'General Intelligence & Reasoning Sectional', url: '/tests/ssc-sec-reasoning', questionsCount: 25, timeMinutes: 15 }
    ],
    chapterwise: [
      { title: 'Chapter 1: Number System & Simplification', url: '/chapters/quant-ch1' },
      { title: 'Chapter 2: Percentage & Profit Loss', url: '/chapters/quant-ch2' },
      { title: 'Chapter 3: Coding-Decoding & Analogy', url: '/chapters/reas-ch1' }
    ]
  },
  {
    id: 'exam_sbi_po_2024',
    title: 'SBI PO Prelims Selection Batch',
    slug: 'sbi-po-prelims-batch',
    seo_description: 'SBI PO Prelims practice package with speed tests and video solutions',
    full_description: 'Targeted preparation course for SBI PO Prelims & Mains. Features adaptive speed tests, High Level Data Interpretation, and Puzzles.',
    category: 'Banking',
    tags: ['sbi', 'po', 'bank', 'prelims'],
    isActive: true,
    buy_price: 599,
    list_price: 2499,
    cover: 'https://picsum.photos/seed/sbipo/300/400',
    classes_count: 200,
    mocks_count: 100,
    previouspapers: [
      { title: 'SBI PO Prelims 2023 Official Paper', url: '/tests/sbi-po-2023', questionsCount: 100, timeMinutes: 60 },
      { title: 'SBI PO Prelims 2022 Official Paper', url: '/tests/sbi-po-2022', questionsCount: 100, timeMinutes: 60 }
    ],
    practicetests: [
      { title: 'SBI PO Prelims All India Live Mock 1', url: '/tests/sbi-mock-1', questionsCount: 100, timeMinutes: 60 },
      { title: 'SBI PO Prelims All India Live Mock 2', url: '/tests/sbi-mock-2', questionsCount: 100, timeMinutes: 60 }
    ],
    sectional: [
      { title: 'High Level Seating Arrangement & Puzzles', url: '/tests/sbi-puzzles', questionsCount: 35, timeMinutes: 20 }
    ],
    chapterwise: [
      { title: 'Data Interpretation: Bar Graph & Caselet', url: '/chapters/di-bar' }
    ]
  },
  {
    id: 'exam_ctet_paper_2024',
    title: 'CTET Paper 1 & 2 Complete Course',
    slug: 'ctet-paper-1-2-complete',
    seo_description: 'CTET Exam preparation with Child Development & Pedagogy focus',
    full_description: 'Complete mock series & study notes for Central Teacher Eligibility Test (CTET) Paper 1 & 2 with latest syllabus coverage.',
    category: 'Teaching',
    tags: ['ctet', 'teaching', 'pedagogy', 'tet'],
    isActive: true,
    buy_price: 399,
    list_price: 1499,
    cover: 'https://picsum.photos/seed/ctet/300/400',
    classes_count: 120,
    mocks_count: 30,
    previouspapers: [
      { title: 'CTET Dec 2023 Paper 1 Solved', url: '/tests/ctet-2023-p1', questionsCount: 150, timeMinutes: 150 }
    ],
    practicetests: [
      { title: 'CTET Paper 1 Full Length Test', url: '/tests/ctet-fl-1', questionsCount: 150, timeMinutes: 150 }
    ],
    sectional: [
      { title: 'Child Development & Pedagogy Sectional', url: '/tests/cdp-sectional', questionsCount: 30, timeMinutes: 30 }
    ],
    chapterwise: [
      { title: 'Piaget, Vygotsky & Kohlberg Concepts', url: '/chapters/cdp-theories' }
    ]
  },
  {
    id: 'exam_rrb_ntpc_2024',
    title: 'RRB NTPC Stage 1 CBT Master Series',
    slug: 'rrb-ntpc-stage-1-cbt',
    seo_description: 'Railways RRB NTPC CBT 1 mock tests with General Science focus',
    full_description: 'Comprehensive practice kit for Railway Recruitment Board NTPC exam including General Awareness, Science, and Mathematics.',
    category: 'Railways',
    tags: ['railways', 'rrb', 'ntpc', 'cbt1'],
    isActive: true,
    buy_price: 349,
    list_price: 1299,
    cover: 'https://picsum.photos/seed/rrbntpc/300/400',
    classes_count: 110,
    mocks_count: 45,
    previouspapers: [
      { title: 'RRB NTPC CBT 1 2021 Shift 1', url: '/tests/rrb-2021-s1', questionsCount: 100, timeMinutes: 90 }
    ],
    practicetests: [
      { title: 'NTPC CBT 1 Full Mock 1', url: '/tests/rrb-mock-1', questionsCount: 100, timeMinutes: 90 }
    ],
    sectional: [
      { title: 'General Science 500 MCQs Kit', url: '/tests/rrb-science', questionsCount: 50, timeMinutes: 30 }
    ],
    chapterwise: [
      { title: 'Physics: Motion & Work Energy', url: '/chapters/physics-motion' }
    ]
  },
  {
    id: 'exam_nda_cds_2024',
    title: 'NDA & NA II Mock Test Series',
    slug: 'nda-na-ii-test-series',
    seo_description: 'UPSC NDA Mathematics & General Ability Test Series',
    full_description: 'Detailed preparation course for UPSC NDA/NA exam featuring full-length paper simulation and performance analytics.',
    category: 'Defense',
    tags: ['nda', 'cds', 'upsc', 'defense'],
    isActive: true,
    buy_price: 449,
    list_price: 1799,
    cover: 'https://picsum.photos/seed/ndadef/300/400',
    classes_count: 140,
    mocks_count: 40,
    previouspapers: [
      { title: 'UPSC NDA II 2023 Mathematics Paper', url: '/tests/nda-2023-math', questionsCount: 120, timeMinutes: 150 }
    ],
    practicetests: [
      { title: 'NDA Mathematics Full Test 1', url: '/tests/nda-math-fl1', questionsCount: 120, timeMinutes: 150 }
    ],
    sectional: [
      { title: 'Trigonometry & Calculus Speed Drills', url: '/tests/nda-trig', questionsCount: 40, timeMinutes: 45 }
    ],
    chapterwise: [
      { title: 'Vectors & 3D Geometry', url: '/chapters/nda-3d' }
    ]
  },
  {
    id: 'exam_ssc_chsl_2024',
    title: 'SSC CHSL Tier 1 Rank Booster',
    slug: 'ssc-chsl-tier-1-booster',
    seo_description: '10+2 CHSL Tier 1 practice series with speed drills',
    full_description: 'Rank booster course for SSC CHSL 10+2 exam. Features daily speed tests and high-frequency previous question practice.',
    category: 'SSC',
    tags: ['ssc', 'chsl', '10+2', 'exam'],
    isActive: true,
    buy_price: 299,
    list_price: 1199,
    cover: 'https://picsum.photos/seed/sscchsl/300/400',
    classes_count: 90,
    mocks_count: 35,
    previouspapers: [
      { title: 'SSC CHSL Tier 1 2023 Memory Paper', url: '/tests/ssc-chsl-2023', questionsCount: 100, timeMinutes: 60 }
    ],
    practicetests: [
      { title: 'SSC CHSL Speed Drill Mock 1', url: '/tests/chsl-sd-1', questionsCount: 100, timeMinutes: 60 }
    ],
    sectional: [
      { title: 'English Language Spotting Errors Test', url: '/tests/chsl-eng', questionsCount: 25, timeMinutes: 15 }
    ],
    chapterwise: [
      { title: 'Algebra & Geometry Formulas Practice', url: '/chapters/chsl-alg' }
    ]
  }
];

export const INITIAL_BOOKS: BookItem[] = [
  {
    id: 'book_bank_po_clean_code',
    title: 'Bank PO',
    slug: 'bank-po',
    seo_description: 'Bank PO Clean Code & Architecture Handbook',
    full_description: 'Comprehensive Bank PO study material covering clean code principles, software architecture, agile methodology, and Java fundamentals for IT Officer & Banking exams.',
    category: 'Banking',
    tags: ['programming', 'architecture', 'agile', 'java'],
    isActive: true,
    buy_price: 160,
    list_price: 200,
    pdf_file: 'books/clean_code.pdf',
    html_file: 'books/clean_code.epub',
    cover: 'https://picsum.photos/seed/cleancode/300/400',
    sample_file: 'samples/clean_code_sample.pdf',
    subtitle: 'IT Officer & Software Aptitude',
    edition: 'Clean Code Edition'
  },
  {
    id: 'book_math_complete_2024',
    title: 'Complete Mathematics',
    slug: 'complete-mathematics-handbook',
    seo_description: 'Comprehensive Mathematics for Competitive Exams (Print + E-Book)',
    full_description: 'All-in-one Mathematics reference book covering Arithmetic, Algebra, Geometry, Trigonometry and Mensuration with 5000+ solved examples.',
    category: 'SSC',
    tags: ['maths', 'quant', 'ssc', 'books'],
    isActive: true,
    buy_price: 350,
    list_price: 600,
    pdf_file: 'books/complete_mathematics.pdf',
    html_file: 'books/complete_mathematics.html',
    cover: 'https://picsum.photos/seed/mathbook/300/400',
    sample_file: 'samples/complete_mathematics_sample.pdf',
    subtitle: 'Print + E-Book',
    edition: '2024 Edition'
  },
  {
    id: 'book_english_general_2024',
    title: 'General English',
    slug: 'general-english-master-edition',
    seo_description: 'Grammar rules, vocabulary flashcards, and comprehension strategies',
    full_description: 'Master general English grammar rules, idioms, phrases, reading comprehension passages, and vocabulary builders tailored for competitive exams.',
    category: 'SSC',
    tags: ['english', 'grammar', 'vocabulary'],
    isActive: true,
    buy_price: 280,
    list_price: 450,
    pdf_file: 'books/general_english.pdf',
    html_file: 'books/general_english.html',
    cover: 'https://picsum.photos/seed/engbook/300/400',
    sample_file: 'samples/general_english_sample.pdf',
    subtitle: 'Latest Edition',
    edition: '5th Revised Edition'
  },
  {
    id: 'book_reasoning_tricks_2024',
    title: 'Reasoning Tricks',
    slug: 'reasoning-tricks-shortcuts',
    seo_description: 'Shortcuts, mind maps and speed techniques for verbal and non-verbal reasoning',
    full_description: 'Fast-track guide to verbal, analytical, and non-verbal reasoning. Packed with 100+ mental tricks to solve puzzles in under 30 seconds.',
    category: 'Banking',
    tags: ['reasoning', 'puzzles', 'shortcuts'],
    isActive: true,
    buy_price: 199,
    list_price: 350,
    pdf_file: 'books/reasoning_tricks.pdf',
    html_file: 'books/reasoning_tricks.html',
    cover: 'https://picsum.photos/seed/reasonbook/300/400',
    sample_file: 'samples/reasoning_tricks_sample.pdf',
    subtitle: 'Shortcut Methods',
    edition: 'Special Speed Edition'
  },
  {
    id: 'book_bank_quant_2024',
    title: 'Quantitative Aptitude for Bank PO',
    slug: 'quant-bank-po-pro',
    seo_description: 'High level Data Interpretation and Quantitative Aptitude for Banking Exams',
    full_description: 'Exhaustive repository of Data Interpretation sets, Caselets, Data Sufficiency, and Number Series designed for SBI PO & IBPS PO Mains.',
    category: 'Banking',
    tags: ['banking', 'quant', 'di', 'po'],
    isActive: true,
    buy_price: 320,
    list_price: 550,
    pdf_file: 'books/bank_quant.pdf',
    html_file: 'books/bank_quant.html',
    cover: 'https://picsum.photos/seed/bankquant/300/400',
    sample_file: 'samples/bank_quant_sample.pdf',
    subtitle: 'Advanced DI & Caselets',
    edition: '2024 PO Mains Edition'
  },
  {
    id: 'book_gk_current_affairs_2024',
    title: 'General Knowledge 2024 Handbook',
    slug: 'gk-current-affairs-yearbook',
    seo_description: 'Yearly current affairs digest, static GK summaries, and science facts',
    full_description: 'Concise handbook covering Indian Polity, History, Geography, Economics, General Science, and monthly current affairs updates.',
    category: 'Railways',
    tags: ['gk', 'currentaffairs', 'railways', 'ssc'],
    isActive: true,
    buy_price: 240,
    list_price: 400,
    pdf_file: 'books/gk_handbook.pdf',
    html_file: 'books/gk_handbook.html',
    cover: 'https://picsum.photos/seed/gkbook/300/400',
    sample_file: 'samples/gk_handbook_sample.pdf',
    subtitle: 'Static GK + Current Affairs',
    edition: 'Yearbook 2024'
  },
  {
    id: 'book_child_pedagogy_2024',
    title: 'Child Development & Pedagogy Master Guide',
    slug: 'child-pedagogy-guide',
    seo_description: 'CDP textbook with chapter summaries and CTET PYQs',
    full_description: 'Thorough theoretical coverage of child psychology, learning theories, inclusive education, and pedagogical strategies for teaching exams.',
    category: 'Teaching',
    tags: ['teaching', 'ctet', 'cdp', 'pedagogy'],
    isActive: true,
    buy_price: 290,
    list_price: 480,
    pdf_file: 'books/child_pedagogy.pdf',
    html_file: 'books/child_pedagogy.html',
    cover: 'https://picsum.photos/seed/cdpbook/300/400',
    sample_file: 'samples/child_pedagogy_sample.pdf',
    subtitle: 'CTET & TET Solved Notes',
    edition: 'Teacher Prep Series'
  }
];

export const INITIAL_BUNDLES: BundleItem[] = [
  {
    id: 'bundle_ssc_mahapack',
    title: 'SSC Mahapack (Exams + Books)',
    slug: 'ssc-mahapack-combo',
    seo_description: 'Includes all SSC exams, live classes, video courses, test series, and ebooks.',
    full_description: 'The ultimate subscription for SSC aspirants! Get instant access to SSC CGL, CHSL, MTS, CPO test series and 5 premium e-books.',
    category: 'SSC',
    tags: ['ssc', 'cgl', 'chsl', 'mahapack', 'bundle', 'combo'],
    isActive: true,
    buy_price: 2999,
    list_price: 9999,
    cover: 'https://picsum.photos/seed/sscpack/300/400',
    badge: 'BESTSELLER',
    logoText: 'SSC',
    included_items: [
      { collection: 'exams', id: 'exam_ssc_cgl_2024' },
      { collection: 'exams', id: 'exam_ssc_chsl_2024' },
      { collection: 'books', id: 'book_math_complete_2024' },
      { collection: 'books', id: 'book_english_general_2024' }
    ]
  },
  {
    id: 'bundle_bank_mahapack',
    title: 'Bank Exam Mahapack',
    slug: 'bank-exam-mahapack',
    seo_description: 'Covers IBPS, SBI, RBI & RRB PO/Clerk exams with test series and books.',
    full_description: 'Complete banking exam pass unlocking SBI PO, IBPS PO, RRB Assistant practice series and advanced quantitative books.',
    category: 'Banking',
    tags: ['bank', 'sbi', 'ibps', 'bundle', 'combo'],
    isActive: true,
    buy_price: 1999,
    list_price: 5999,
    cover: 'https://picsum.photos/seed/bankpack/300/400',
    badge: 'POPULAR',
    logoText: 'Bank',
    included_items: [
      { collection: 'exams', id: 'exam_sbi_po_2024' },
      { collection: 'books', id: 'book_reasoning_tricks_2024' },
      { collection: 'books', id: 'book_bank_quant_2024' }
    ]
  },
  {
    id: 'bundle_teaching_pass',
    title: 'Teaching & TET Ultimate Pass',
    slug: 'teaching-tet-pass',
    seo_description: 'All CTET, State TET & KVS recruitment exams and study books.',
    full_description: 'All-in-one preparation package for Teaching exams including CTET mock tests, CDP books, and solved paper archives.',
    category: 'Teaching',
    tags: ['teaching', 'ctet', 'tet', 'bundle'],
    isActive: true,
    buy_price: 1499,
    list_price: 4499,
    cover: 'https://picsum.photos/seed/teachpack/300/400',
    badge: 'TOP VALUE',
    logoText: 'Teaching',
    included_items: [
      { collection: 'exams', id: 'exam_ctet_paper_2024' },
      { collection: 'books', id: 'book_child_pedagogy_2024' }
    ]
  }
];
