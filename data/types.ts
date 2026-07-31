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

// "Where does this go wrong?" — an argument laid out as numbered steps, one of
// which is the broken one. The home for trick questions: the flawed step should
// read as perfectly reasonable until it's named, and `explanation` must NAME the
// move (hasty generalisation, affirming the consequent, appeal to popularity)
// rather than just saying it's wrong. Max 3-5 steps, each under 16 words —
// beyond that the reader is doing comprehension, not spotting.
export interface TapFlawStep {
  id: string;
  text: string;
}

export interface TapFlawInteraction {
  type: 'tap-flaw';
  steps: TapFlawStep[];      // 3-5, in argument order
  flawedId: string;          // exactly one
  /** Names the fallacy and says why the step is tempting. */
  explanation: string;
}

// Two named camps and a small stack of statements to flick into one or the
// other. Good for "who would say this" and for premise/conclusion drills; the
// reader commits with a gesture rather than reading four boxes.
export interface TwoCampsItem {
  id: string;
  text: string;              // max ~14 words — it has to fit a card mid-swipe
  side: 'left' | 'right';
}

export interface TwoCampsInteraction {
  type: 'two-camps';
  leftLabel: string;         // 1-2 words; it sits in a corner of the screen
  rightLabel: string;
  items: TwoCampsItem[];     // 3-5; longer outstays the format
  explanation: string;
}

export type InteractionData =
  | MultipleChoiceInteraction
  | TrueFalseInteraction
  | SortItemsInteraction
  | FillBlankInteraction
  | MatchInteraction
  | TapFlawInteraction
  | TwoCampsInteraction;

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

// "Choose Your Belief" — a moral/philosophical scenario with no single right
// answer. The user picks, then sees what different thinkers would say and why.
export interface DilemmaChoice {
  id: string;
  label: string;         // a concrete option, max 12 words
}

export interface DilemmaView {
  thinker: string;       // philosopher / school name
  stance: string;        // their position in a phrase, max 12 words
  why: string;           // the reasoning, max 40 words
}

export interface DilemmaCard {
  type: 'dilemma';
  scenario: string;      // the situation, max 80 words
  prompt: string;        // the question, max 16 words
  choices: DilemmaChoice[];
  views: DilemmaView[];  // 2-4 philosophers' takes, revealed after choosing
  xpValue: number;
}

// A philosopher's quote the user can sit with — and save. Shows the quotation,
// who wrote it, and when. The Save button bookmarks it into the user's quotes.
export interface QuoteCard {
  type: 'quote';
  id: string;            // stable unique id for saving, e.g. 'lq-ethics-1'
  quote: string;         // the quotation itself, max ~28 words
  author: string;        // who said or wrote it
  era: string;           // when it was written, e.g. 'c. 340 BCE' or '1785'
  work?: string;         // optional source text, e.g. 'Nicomachean Ethics'
  philosopherId?: string; // optional link to a philosopher in our database
}

export type CardData =
  | HookCard
  | ConceptCard
  | ExampleCard
  | QuestionCard
  | ReinforcementCard
  | SummaryCard
  | DilemmaCard
  | QuoteCard;

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
