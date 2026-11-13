export type DisplayMode = 'full' | 'kana' | 'challenge';

export type ChoiceKey = 'A' | 'B' | 'C' | 'D';

export interface VocabItem {
  id: string;
  kanji: string;
  kana: string;
  romaji: string;
  meaning: string;
  note?: string;
  isTrap?: boolean;
}

export interface CountryItem {
  id: string;
  viName: string;
  countryJp: string;
  countryKana: string;
  countryRomaji: string;
  nationalityJp: string;
  nationalityKana: string;
  nationalityRomaji: string;
}

export interface GrammarPattern {
  id: string;
  title: string;
  structure: string;
  exampleJp: string;
  exampleRomaji: string;
  exampleVi: string;
  notes: string[];
  isTrap?: boolean;
}

export interface ConfusingPair {
  id: string;
  title: string;
  leftLabel: string;
  leftUsage: string;
  leftExample: string;
  rightLabel: string;
  rightUsage: string;
  rightExample: string;
  warning: string;
}

export interface AgeReading {
  age: number;
  kanji: string;
  kana: string;
  romaji: string;
  note: string;
  isTrap: boolean;
}

export interface DayReading {
  day: number;
  kanji: string;
  kana: string;
  romaji: string;
  category: 'special' | 'shichi-ku' | 'regular';
  note: string;
  missingFromPdfTable?: boolean;
}

export interface MonthReading {
  month: number;
  kanji: string;
  kana: string;
  romaji: string;
  isTrap: boolean;
  note: string;
}

export interface ParticleDrillItem {
  id: string;
  before: string;
  after: string;
  meaning: string;
  options: string[];
  correct: string;
  explanation: string;
}

export interface DialogueMatchItem {
  id: string;
  promptJp: string;
  promptRomaji: string;
  promptVi: string;
  correctReplyId: string;
  explanation: string;
}

export interface DialogueReplyOption {
  id: string;
  replyJp: string;
  replyRomaji: string;
  replyVi: string;
}

export interface TrapChoiceItem {
  id: string;
  label: string;
  questionHint: string;
  optionA: string;
  optionB: string;
  correct: 'A' | 'B';
  explanation: string;
}

export interface BugSegment {
  id: string;
  text: string;
  isBug: boolean;
  fixedText?: string;
  explanation?: string;
}

export interface QuizQuestion {
  id: number;
  section: string;
  prompt: string;
  subPrompt?: string;
  type: 'mcq' | 'order';
  orderTokens?: string[];
  options: Record<ChoiceKey, string>;
}

export interface QuizAnswerEntry {
  questionId: number;
  correctChoice: ChoiceKey;
  explanation: string;
}

export interface GradedQuestionResult {
  question_id: number;
  selected_choice: ChoiceKey | null;
  correct_choice: ChoiceKey;
  is_correct: boolean;
  explanation: string;
}

export interface QuizAttemptSession {
  attemptId: string;
  attemptNumber: number;
  studentName: string;
  studentCode: string;
  startedAt: string;
  mode: 'supabase' | 'local-demo';
}

export interface QuizSubmissionResult {
  attempt_id: string;
  attempt_number: number;
  student_name: string;
  student_code: string;
  score: number;
  total_questions: number;
  duration_ms: number;
  submitted_at: string;
  already_submitted?: boolean;
  results: GradedQuestionResult[];
}

export interface ScoreboardEntry {
  id: string;
  attempt_id: string;
  student_name: string;
  student_code: string;
  attempt_number: number;
  score: number;
  total_questions: number;
  duration_ms: number;
  submitted_at: string;
}
