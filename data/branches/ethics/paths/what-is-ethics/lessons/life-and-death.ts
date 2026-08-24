import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-19',
  slug: 'life-and-death',
  title: 'Whose Life, Whose Choice?',
  description: 'Autonomy, personhood, and the right to die. The hardest applied questions.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Whose body is it? Whose death?',
      subtext: 'A dying patient in constant pain asks for help to end it. Who decides?',
      emoji: '🕯️',
    },
    {
      type: 'concept',
      title: 'Two Principles in Collision',
      body: 'Life-and-death ethics turns on two ideas. Autonomy: the right to govern your own body and your own death. Sanctity of life: innocent life is inviolable, never to be intentionally ended. In euthanasia, these two principles meet head-on.',
      visual: '⚖️',
      highlight: 'autonomy vs sanctity of life',
    },
    {
      type: 'example',
      title: 'Mill and the Sovereign Self',
      scenario: 'John Stuart Mill argued that the only purpose for which power may be rightly used over a person against their will is to prevent harm to others. Over a competent adult’s own body and mind, no one else holds authority. Choices that harm only oneself, he held, belong to the chooser alone.',
      source: 'J. S. Mill, On Liberty (1859)',
      emoji: '🗝️',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-19-1',
      quote: 'Over himself, over his own body and mind, the individual is sovereign.',
      author: 'John Stuart Mill',
      era: '1859',
      work: 'On Liberty',
      philosopherId: 'john-stuart-mill',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw the Categorical Imperative.',
      body: 'Kant’s second formula: treat humanity, in yourself or others, never merely as a means but always also as an end. You met it applied to others. Now turn it inward: does it bind how you may treat your own life?',
      emoji: '🔁',
    },
    {
      type: 'dilemma',
      scenario:
        'A terminally ill, mentally competent patient in constant pain asks a doctor to help them die. The request is clear, repeated, and informed. Should the law permit assisted dying in cases like this?',
      prompt: 'Should the law permit it?',
      choices: [
        { id: 'permit', label: 'Yes, a competent person may choose' },
        { id: 'forbid', label: 'No, ending innocent life is wrong' },
      ],
      views: [
        {
          thinker: 'Mill (autonomy liberal)',
          stance: 'the sovereign individual may choose',
          why: 'Over one’s own body and mind no one else is sovereign. Competent, informed consent settles it; the state may not override a self-regarding choice to avoid harm only to oneself.',
        },
        {
          thinker: 'Kantian view',
          stance: 'it treats your humanity merely as a means',
          why: 'Ending oneself to escape pain uses one’s own rational nature as a tool for relief. That violates the duty to respect humanity as an end, in yourself as much as in others.',
        },
        {
          thinker: 'Sanctity-of-life (natural law)',
          stance: 'innocent life is inviolable',
          why: 'Human life carries a worth no consent can waive. Intentionally ending an innocent life is always wrong, however merciful the motive or willing the patient.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'question',
      prompt: 'Why does the Kantian object to assisted dying even when the patient freely consents?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Using one’s own humanity merely as a means to escape pain violates the duty to respect persons', isCorrect: true },
          { id: 'b', text: 'The patient’s consent cannot be truly informed while in pain', isCorrect: false },
          { id: 'c', text: 'Allowing it would lead society down a slippery slope to abuse', isCorrect: false },
          { id: 'd', text: 'It produces less total happiness than keeping the patient alive', isCorrect: false },
        ],
        explanation: 'Options C and D tempt by sliding into other arguments: C is the slippery-slope appeal (judging the act by feared consequences, not the act itself), and D is a utilitarian calculation. The Kantian objection is neither. It rests on the second formula: humanity must never be treated merely as a means, so even consent cannot license using one’s own person as a tool.',
      },
    },
    {
      // (E37c) The scene asks two graded questions; the data file has to ask the
      // same two. This mirrors the deck question in components/lesson/cinematic.
      type: 'question',
      prompt: 'A competent adult refuses treatment that would save their life. What follows on Mill’s view?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Their refusal stands', isCorrect: true },
          { id: 'b', text: 'Treat them, then ask afterwards', isCorrect: false },
          { id: 'c', text: 'Treat them if the odds are good enough', isCorrect: false },
          { id: 'd', text: 'Let the family decide instead', isCorrect: false },
        ],
        explanation: 'The refusal stands. This is the hardest case for the harm principle and Mill takes it: risk to yourself is never enough to hand the decision to somebody else. Overriding a competent refusal treats a person as a thing to be managed. The test is not how dangerous the choice is — it is whether anybody else is in it.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Autonomy and sanctity of life collide here',
        'Mill: the competent self is sovereign',
        'Kant’s second formula now applies inward',
        'Consent does not settle every duty',
      ],
      closingThought: 'The hardest applied questions are where two true-sounding principles cannot both win.',
    },
  ],
};

export default lesson;
