// ─── Interaction types (nested discriminated union) ─────────────────────────

export interface MultipleChoiceOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface MultipleChoiceInteraction {
  type: 'multiple-choice';
  options: MultipleChoiceOption[];
  explanation: string;
}

export interface TrueFalseInteraction {
  type: 'true-false';
  answer: boolean;
  explanation: string;
}

export interface SortItemsInteraction {
  type: 'sort';
  items: { id: string; text: string }[];
  correctOrder: string[]; // array of item ids in correct order
  explanation: string;
}

export interface FillBlankInteraction {
  type: 'fill-blank';
  sentence: string; // use ___ for blank
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface MatchInteraction {
  type: 'match';
  pairs: { id: string; left: string; right: string }[];
  explanation: string;
}

export type InteractionData =
  | MultipleChoiceInteraction
  | TrueFalseInteraction
  | SortItemsInteraction
  | FillBlankInteraction
  | MatchInteraction;

// ─── Card types (top-level discriminated union) ──────────────────────────────

export interface HookCard {
  type: 'hook';
  headline: string;      // Bold provocative statement, max 12 words
  subtext?: string;      // Optional supporting line, max 20 words
  emoji?: string;
}

export interface ConceptCard {
  type: 'concept';
  title: string;
  body: string;          // Max 60 words
  visual?: string;       // Emoji or icon name
  highlight?: string;    // Key term to emphasize
}

export interface ExampleCard {
  type: 'example';
  title: string;
  scenario: string;      // Max 80 words
  source?: string;       // "Aristotle, Nicomachean Ethics"
  emoji?: string;
}

export interface QuestionCard {
  type: 'question';
  prompt: string;        // Max 25 words
  interaction: InteractionData;
  xpValue: number;
}

export interface ReinforcementCard {
  type: 'reinforcement';
  callout: string;       // "Earlier you learned..." — max 15 words
  body: string;          // Reinforcement content, max 50 words
  emoji?: string;
}

export interface SummaryCard {
  type: 'summary';
  title: string;
  keyPoints: string[];   // 2-4 bullet points, max 12 words each
  closingThought?: string; // Optional inspiring closer
}

export type CardData =
  | HookCard
  | ConceptCard
  | ExampleCard
  | QuestionCard
  | ReinforcementCard
  | SummaryCard;

// ─── Curriculum hierarchy ────────────────────────────────────────────────────

export interface Lesson {
  id: string;
  slug: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  xpReward: number;
  cards: CardData[];
}

export interface Path {
  id: string;
  slug: string;
  name: string;
  description: string;
  lessons: Lesson[];
}

export interface Branch {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  paths: Path[];
}

// ─── Session state ───────────────────────────────────────────────────────────

export interface AnswerResult {
  cardIndex: number;
  correct: boolean;
  xpEarned: number;
}

export interface LessonSession {
  lesson: Lesson;
  currentIndex: number;
  direction: 1 | -1;
  answers: AnswerResult[];
  sessionXP: number;
  startedAt: number; // timestamp
}
