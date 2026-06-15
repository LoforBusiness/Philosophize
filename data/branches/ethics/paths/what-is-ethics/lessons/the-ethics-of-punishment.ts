import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-24',
  slug: 'the-ethics-of-punishment',
  title: 'Why Do We Punish?',
  description: 'To give wrongdoers what they deserve, to deter the rest, or to repair the person?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Someone does wrong. Society makes them suffer. Why?',
      subtext: 'The answer you give quietly shapes who gets locked up, for how long, and to what end.',
      emoji: '⚖️',
    },
    {
      type: 'concept',
      title: 'Three Reasons We Punish',
      body: 'Retribution: the guilty deserve to suffer in proportion to their wrong, looking back at what they did. Deterrence: punishment discourages future crime, looking forward at consequences. Rehabilitation: punishment should reform the offender into someone who will not reoffend. Each answers "why punish?" differently.',
      visual: '🔱',
      highlight: 'retribution, deterrence, rehabilitation',
    },
    {
      type: 'example',
      title: 'One Theft, Three Verdicts',
      scenario: 'A man steals to feed his family. A retributivist asks only what his act deserves. A deterrence theorist asks what sentence will best discourage future thefts — perhaps a harsh public one. A rehabilitationist asks what will help him build an honest life. The same crime yields three very different punishments depending on the question you start from.',
      emoji: '🍞',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-24-1',
      quote: 'Judicial punishment can never be used merely as a means to promote some other good, but must in all cases be imposed only because the individual has committed a crime.',
      author: 'Immanuel Kant',
      era: '1797',
      work: 'The Metaphysics of Morals',
      philosopherId: 'immanuel-kant',
    },
    {
      type: 'concept',
      title: 'The Danger Of Pure Deterrence',
      body: 'Deterrence looks forward, so in principle it could justify framing an innocent person if doing so calmed a panicked public and prevented riots. Retributivists object: punishment must track actual guilt, not mere usefulness. Kant insists we punish people because they are guilty, never merely to send a message.',
      visual: '🚫',
      highlight: 'never merely as a means',
    },
    {
      type: 'question',
      prompt: 'Framing an innocent person to calm a mob and prevent worse violence — which theory is most exposed to this objection?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Retribution, because the innocent person deserves it', isCorrect: false },
          { id: 'b', text: 'Pure deterrence, because it judges punishment only by future good outcomes', isCorrect: true },
          { id: 'c', text: 'Rehabilitation, because reform requires guilt', isCorrect: false },
          { id: 'd', text: 'None, since framing the innocent is always obviously useful', isCorrect: false },
        ],
        explanation: 'Option A is the tempting trap: it misreads retribution. Retribution punishes only the guilty, so it forbids framing the innocent outright. The objection bites hardest on pure deterrence, which justifies punishment by its forward-looking effects. If framing an innocent person would maximize deterrence, the theory seems to permit it — which most of us find monstrous.',
      },
    },
    {
      type: 'dilemma',
      scenario: 'A teenager commits a serious but non-violent crime. The judge can impose a long prison term that would strongly deter others, a sentence strictly matching what the act "deserves," or a shorter program of education and supervised work designed to reform him.',
      prompt: 'What should the sentence aim at?',
      choices: [
        { id: 'a', label: 'Deserved suffering, no more, no less' },
        { id: 'b', label: 'Maximum deterrence for society' },
        { id: 'c', label: 'Reforming him into a non-offender' },
      ],
      views: [
        {
          thinker: 'Retributivist',
          stance: 'Match the punishment to the desert.',
          why: 'Justice is backward-looking. He should get what his act warrants — neither inflated to scare others nor softened by guesses about his future. Using him to deter society treats him as a tool, not a person.',
        },
        {
          thinker: 'Deterrence theorist',
          stance: 'Choose the sentence that prevents most crime.',
          why: 'Punishment’s point is to protect future victims. If a visible, firm sentence stops others from offending, that good outweighs the offender’s discomfort. We should ask what works, not what merely satisfies.',
        },
        {
          thinker: 'Rehabilitationist',
          stance: 'Aim to make him a better citizen.',
          why: 'Locking up a young person often hardens him. Education and work can turn a wrongdoer into someone who will not reoffend — the best protection of all, and the most humane response.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Retribution looks back at desert',
        'Deterrence looks forward at prevention',
        'Rehabilitation aims to reform the offender',
        'Pure deterrence risks punishing the innocent',
      ],
      closingThought: 'Before debating the sentence, ask the deeper question: what is punishment even for?',
    },
  ],
};

export default lesson;
