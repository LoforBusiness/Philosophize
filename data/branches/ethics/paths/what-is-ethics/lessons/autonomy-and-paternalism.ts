import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-25',
  slug: 'autonomy-and-paternalism',
  title: 'For Your Own Good',
  description: 'When, if ever, may others override your choices to protect you from yourself?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'They stopped you "for your own good." Were they right?',
      subtext: 'Seatbelt laws, banned drugs, locked-away cigarettes — when may others decide for you?',
      emoji: '🛡️',
    },
    {
      type: 'concept',
      title: 'Autonomy vs Paternalism',
      body: 'Autonomy is your right to govern your own life by your own choices. Paternalism is interfering with someone’s liberty for their own good, against their will — like a parent overriding a child. The clash: how much may we limit a competent adult’s freedom to protect them from themselves?',
      visual: '🔓',
      highlight: 'autonomy versus paternalism',
    },
    {
      type: 'concept',
      title: 'Mill’s Harm Principle',
      body: 'John Stuart Mill drew a sharp line. Power may be used over a competent adult against their will only to prevent harm to others. Their own good is not sufficient warrant. You may warn, persuade, or plead — but not compel — when the only person at risk is themselves.',
      visual: '➖',
      highlight: 'harm to others',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-25-1',
      quote: 'The only purpose for which power can be rightfully exercised over any member of a civilised community, against his will, is to prevent harm to others.',
      author: 'John Stuart Mill',
      era: '1859',
      work: 'On Liberty',
      philosopherId: 'john-stuart-mill',
    },
    {
      type: 'example',
      title: 'The Unsafe Bridge',
      scenario: 'Mill offers a test. Suppose you see someone about to cross a bridge you know is unsafe, and there is no time to warn them. You may grab them and stop them — not to control their life, but because they almost certainly do not want to fall. Once warned, though, an informed adult is free to cross. The stop respects, not overrides, their will.',
      source: 'John Stuart Mill, On Liberty (1859)',
      emoji: '🌉',
    },
    {
      type: 'question',
      prompt: 'Mill says we may stop the person on the unsafe bridge. Does this contradict his ban on paternalism?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes, he admits paternalism is fine when we think we know best', isCorrect: false },
          { id: 'b', text: 'No, the stop assumes they don’t want to fall; once informed, they’re free to choose', isCorrect: true },
          { id: 'c', text: 'Yes, so the harm principle is meaningless', isCorrect: false },
          { id: 'd', text: 'No, because Mill forbids ever touching another person', isCorrect: false },
        ],
        explanation: 'Option A is the tempting trap: it reads the bridge case as Mill caving to paternalism. He is not. The intervention is justified because the person lacks information about the danger, not because we override an informed choice. We act on what they presumably want — to live. Give them the facts, and a competent adult may still cross. That respects autonomy rather than violating it.',
      },
    },
    {
      type: 'dilemma',
      scenario: 'A government considers an outright ban on a legal but very harmful product that only damages the user’s own health. Option one: ban it. Option two: leave it legal but require stark warnings, taxes, and plain packaging to "nudge" people away. Option three: full freedom, with public education only.',
      prompt: 'How far may the state go for citizens’ own good?',
      choices: [
        { id: 'a', label: 'Ban it outright' },
        { id: 'b', label: 'Nudge with warnings and taxes' },
        { id: 'c', label: 'Leave it fully free; educate only' },
      ],
      views: [
        {
          thinker: 'Mill (anti-paternalist)',
          stance: 'No ban; the harm is only to oneself.',
          why: 'Over their own body and mind, the individual is sovereign. The state may inform and warn, but compelling competent adults "for their own good" treats them as children and corrodes the freedom that makes us responsible agents.',
        },
        {
          thinker: 'Libertarian paternalist',
          stance: 'Nudge, don’t ban.',
          why: 'People are predictably irrational and weak-willed. We can structure choices — defaults, warnings, friction — to steer them toward what they themselves would endorse, while still leaving the final decision in their hands.',
        },
        {
          thinker: 'Hard paternalist',
          stance: 'Ban it; protect people from ruin.',
          why: 'When a product reliably destroys health and hooks the vulnerable, "free choice" is partly an illusion shaped by addiction and marketing. A caring society sometimes removes the trap rather than watching people walk into it.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Autonomy is self-governance; paternalism overrides it',
        'Mill: coerce only to prevent harm to others',
        'The bridge case respects, not overrides, choice',
        'Nudges sit between full freedom and bans',
      ],
      closingThought: 'The real question is rarely "is it harmful?" but "whose life is it to risk?"',
    },
  ],
};

export default lesson;
