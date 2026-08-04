// ─────────────────────────────────────────────────────────────────────────────
// The three welcome questions, and what they do.
//
// Every answer carries a small WEIGHT VECTOR over the six branches rather than
// naming one, and the three answers are summed. A one-answer-to-one-branch map
// would need each question to be a complete partition of the subject, which is
// how onboarding quizzes end up asking the same thing three times in different
// words. Weights let each question ask something genuinely different — why you
// came, what you want to be better at, what you would sit and think about — and
// still add up to a single steer.
//
// Nothing here gates anything. The winner is a SUGGESTION: Quick Start prefers
// it, and all six branches stay open exactly as before.
// ─────────────────────────────────────────────────────────────────────────────

export type BranchSlug =
  | 'metaphysics'
  | 'epistemology'
  | 'logic'
  | 'ethics'
  | 'aesthetics'
  | 'political-philosophy';

/**
 * Tie-break order, and it is deliberate rather than alphabetical: on a perfect
 * three-way tie a beginner is better served starting where the questions are
 * most famous and least technical. Logic and political philosophy are further
 * down for the same reason — they are the two that most reward already knowing
 * why you care.
 */
export const BRANCH_PRIORITY: BranchSlug[] = [
  'metaphysics',
  'ethics',
  'epistemology',
  'aesthetics',
  'logic',
  'political-philosophy',
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
        id: 'free',
        text: 'Whether anything I choose is really mine to choose',
        weights: { metaphysics: 3, ethics: 1 },
      },
      {
        id: 'true',
        text: 'How to tell what is actually true',
        weights: { epistemology: 3, logic: 1 },
      },
      {
        id: 'right',
        text: 'How we ought to treat each other',
        weights: { ethics: 3, 'political-philosophy': 1 },
      },
      {
        id: 'beauty',
        text: 'Why some things move me and others do not',
        weights: { aesthetics: 3, metaphysics: 1 },
      },
    ],
  },
  {
    id: 'skill',
    prompt: 'Which would you rather get better at?',
    options: [
      {
        id: 'arguments',
        text: 'Spotting when an argument does not hold',
        weights: { logic: 3, epistemology: 1 },
      },
      {
        id: 'hard-calls',
        text: 'Deciding what is right when it is genuinely hard',
        weights: { ethics: 3 },
      },
      {
        id: 'seeing',
        text: 'Seeing what a piece of work is actually doing',
        weights: { aesthetics: 3 },
      },
      {
        id: 'society',
        text: 'Arguing well about how a society should run',
        weights: { 'political-philosophy': 3, ethics: 1 },
      },
    ],
  },
  {
    id: 'sit',
    prompt: 'Which question would you rather sit with?',
    options: [
      {
        id: 'something',
        text: 'Why is there something rather than nothing?',
        weights: { metaphysics: 3 },
      },
      {
        id: 'know',
        text: 'Can I ever really know anything?',
        weights: { epistemology: 3, logic: 1 },
      },
      {
        id: 'obey',
        text: 'Who has the right to tell me what to do?',
        weights: { 'political-philosophy': 3 },
      },
      // Logic's SECOND strong answer, and it needs one. Every other branch is
      // named at weight 3 by two different questions; logic had only "spotting
      // when an argument does not hold", so the most logic-minded answers
      // possible still lost — epistemology was lifted alongside it every time
      // and won the tie-break. A branch no combination can reach is a branch the
      // questions may as well not mention. (The probe counts this: all 64
      // combinations are enumerated and every branch must win at least one.)
      {
        id: 'contradiction',
        text: 'Can something be true and false at the same time?',
        weights: { logic: 3 },
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
