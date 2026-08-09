export interface ExamCategory {
  id: string;
  name: string;
  slug: string;
  seo_description: string;
  isActive: boolean;
  display_order: number;
}

export interface TestLink {
  title: string;
  url: string;
  questionsCount?: number;
  timeMinutes?: number;
  marks?: number;
  isFree?: boolean;
  language?: string;
  badge?: string;
  type?: 'exam' | 'subject' | 'chapter' | 'paper';
}

export interface ExamItem {
  id: string;
  title: string;
  slug: string;
  seo_description: string;
  full_description: string;
  category: string;
  tags: string[];
  isActive: boolean;
  buy_price: number;
  list_price: number;
  cover: string;
  classes_count?: number;
  mocks_count?: number;
  previouspapers: TestLink[];
  practicetests: TestLink[];
  sectional: TestLink[];
  chapterwise: TestLink[];
}

export interface BookItem {
  id: string;
  title: string;
  slug: string;
  seo_description: string;
  full_description: string;
  category: string;
  tags: string[];
  isActive: boolean;
  buy_price: number;
  list_price: number;
  pdf_file: string;
  html_file: string;
  cover: string;
  sample_file: string;
  subtitle?: string;
  edition?: string;
  publisher?: string;
  rating?: number;
  review_count?: number;
  rent_price?: number;
  mcq_count?: string;
}

export interface BundleIncludedItem {
  collection: 'exams' | 'books';
  id: string;
}

export interface BundleItem {
  id: string;
  title: string;
  slug: string;
  seo_description: string;
  full_description: string;
  category: string;
  tags: string[];
  isActive: boolean;
  buy_price: number;
  list_price: number;
  cover: string;
  included_items: BundleIncludedItem[];
  badge?: string;
  logoText?: string;
}

export type AccessType = 'lifetime' | 'rent' | 'subscription';

export interface UserEntitlement {
  id: string;
  collection: 'exams' | 'books' | 'bundles';
  item_id: string;
  category: string;
  granted_via: string; // "direct", bundle_id, or "subscription"
  purchased_at: string;
  access_type: AccessType;
  expires_at?: string | null; // null for lifetime, ISO string for rent/subscription
  download_offline_enabled?: boolean; // true for lifetime, false for rent/subscription
}

export interface UserSubscription {
  active: boolean;
  subscribed_at?: string;
  expires_at?: string;
  plan?: 'monthly';
}

export interface PurchaseRecord {
  id: string;
  user_id: string;
  item_type: 'exam' | 'book' | 'bundle' | 'subscription';
  item_id: string;
  item_title: string;
  amount: number;
  access_type: AccessType;
  created_at: string;
  expires_at?: string | null;
}

export type QuestionStatus = 'not_visited' | 'not_answered' | 'answered' | 'marked_for_review' | 'answered_and_marked';

export interface QuestionItem {
  id: string;
  stem: string;
  opts: string[];
  key: number;
  sol: string;
  tag?: string;
  blocks?: any[];
  positiveMarks?: number;
  negativeMarks?: number;
}

export interface SectionSchema {
  id: string;
  title: string;
  questions: QuestionItem[];
}

export interface ExamSchema {
  id: string;
  title: string;
  timeMinutes: number;
  totalMarks: number;
  negativeMarking: number;
  sections: SectionSchema[];
}

export interface QuestionResponse {
  qId: string;
  sectionId: string;
  ans: number | null;
  status: QuestionStatus;
  timeSec: number;
}

export interface ExamResult {
  examId: string;
  examTitle: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  marksObtained: number;
  totalMarks: number;
  accuracyPercentage: number;
  totalTimeSpentSec: number;
  responses: QuestionResponse[];
  tagAnalysis?: { tag: string; correct: number; total: number; timeSpent: number }[];
  completedAt?: string;
  negativeMarks?: number;
  score?: number;
  maxScore?: number;
  correctCount?: number;
  incorrectCount?: number;
  accuracy?: number;
  topicBreakdown?: Record<string, { tag: string; correct: number; total: number; timeSpent: number }>;
}
