// ─────────────────────────────────────────────────────────────────────────────
// The three welcome questions, and what they do.
//
// Every answer carries a small WEIGHT VECTOR over the seven subjects rather than
// naming one, and the three answers are summed. A one-answer-to-one-subject map
// would need each question to be a complete partition, which is how onboarding
// quizzes end up asking the same thing three times in different words. Weights let
// each question ask something genuinely different — why you came, what you want to
// be better at, what you would sit and think about — and still add up to a single
// steer.
//
// SINCE 2026-09-30 THE STEER IS A SUBJECT. Every subject is one road (data/subjects.ts)
// and the key is its road's slug, which is what Quick Start matches. The questions used
// to weigh philosophy's six branches, which are retired; every subject must still win
// at least one of the 64 answer combinations (scratchpad/onboard-new.mjs enumerates
// them — philosophy 14, psychology 12, personal growth 8, business 7, economics 10,
// science 6, history 7).
//
// Nothing here gates anything. The winner is a SUGGESTION: Quick Start prefers it until
// the reader finishes a lesson anywhere, and every subject stays open exactly as before.
// ─────────────────────────────────────────────────────────────────────────────

export type BranchSlug =
  | 'philosophy'
  | 'psychology'
  | 'personal-growth'
  | 'business'
  | 'economics'
  | 'science'
  | 'history';

/**
 * Tie-break order: the subjects' own order (data/subjects.ts), so the same answers
 * always give the same subject.
 */
export const BRANCH_PRIORITY: BranchSlug[] = [
  'philosophy',
  'psychology',
  'personal-growth',
  'business',
  'economics',
  'science',
  'history',
];

export interface OnboardingOption {
  id: string;
  text: string;
  weights: Partial<Record<BranchSlug, number>>;
}

export interface OnboardingQuestion {
  id: string;
  prompt: string;
  options: OnboardingOption[];
}

export const ONBOARDING_QUESTIONS: OnboardingQuestion[] = [
  {
    id: 'why',
    prompt: 'What pulled you here?',
    options: [
      {
        id: 'people',
        text: 'Understanding why people do what they do',
        weights: { psychology: 3, business: 1 },
      },
      {
        id: 'better',
        text: 'Building better habits, and a better me',
        weights: { 'personal-growth': 3, psychology: 1 },
      },
      {
        id: 'money',
        text: 'Knowing how money and markets really work',
        weights: { economics: 3, business: 1 },
      },
      {
        id: 'world',
        text: 'Finding out how the world works',
        weights: { science: 3, history: 1 },
      },
    ],
  },
  {
    id: 'skill',
    prompt: 'Which would you rather get better at?',
    options: [
      {
        id: 'lead',
        text: 'Leading people and building something of my own',
        weights: { business: 3, 'personal-growth': 1 },
      },
      {
        id: 'think',
        text: 'Thinking clearly about the big questions',
        weights: { philosophy: 3, science: 1 },
      },
      {
        id: 'decide',
        text: 'Making smarter choices with my money',
        weights: { economics: 3, 'personal-growth': 1 },
      },
      {
        id: 'news',
        text: 'Understanding the news, and how we got here',
        weights: { history: 3, economics: 1 },
      },
    ],
  },
  {
    id: 'sit',
    prompt: 'Which question would you rather sit with?',
    options: [
      {
        id: 'good-life',
        text: 'What makes a life a good one?',
        weights: { philosophy: 3, 'personal-growth': 1 },
      },
      {
        id: 'mind',
        text: 'Why do we fool ourselves so easily?',
        weights: { psychology: 3 },
      },
      {
        id: 'past',
        text: 'How did the world end up the way it is?',
        weights: { history: 3, economics: 1 },
      },
      {
        id: 'universe',
        text: 'What is the universe actually made of?',
        weights: { science: 3, philosophy: 1 },
      },
    ],
  },
];

/**
 * Sum the chosen answers' weights and take the leader, breaking ties by
 * BRANCH_PRIORITY so the same answers always give the same branch.
 *
 * Returns null only if nothing was answered, which is what a skip produces —
 * and a null `startingBranch` is the same "no steer" the app had before, not a
 * broken state.
 */
export function branchFromAnswers(picked: (string | null)[]): BranchSlug | null {
  const totals = new Map<BranchSlug, number>();
  let answered = 0;
  ONBOARDING_QUESTIONS.forEach((q, i) => {
    const opt = q.options.find((o) => o.id === picked[i]);
    if (!opt) return;
    answered++;
    for (const [slug, n] of Object.entries(opt.weights)) {
      totals.set(slug as BranchSlug, (totals.get(slug as BranchSlug) ?? 0) + (n ?? 0));
    }
  });
  if (answered === 0) return null;
  let best: BranchSlug | null = null;
  let bestScore = -1;
  for (const slug of BRANCH_PRIORITY) {
    const score = totals.get(slug) ?? 0;
    if (score > bestScore) {
      bestScore = score;
      best = slug;
    }
  }
  return bestScore > 0 ? best : null;
}
