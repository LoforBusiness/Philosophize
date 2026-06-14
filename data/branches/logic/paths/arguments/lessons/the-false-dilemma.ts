import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-12',
  slug: 'the-false-dilemma',
  title: 'The Trap Of Only Two Doors',
  description: 'A false dilemma fakes a forced choice by hiding every option but two.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Two doors, no exit — but who built the room?',
      subtext: 'Some "either/or" choices are real. Others quietly delete every other option.',
      emoji: '🚪',
    },
    {
      type: 'concept',
      title: 'The False Dilemma',
      body: 'A false dilemma presents two options as if they were the only ones — when more exist, or a middle ground does. It takes a genuine "or" and rigs it, cornering you into a choice that was never truly forced.',
      visual: '⚖️',
      highlight: 'as if they were the only ones',
    },
    {
      type: 'example',
      title: 'You\'re Either With Us…',
      scenario: '"You\'re either with us or against us." It sounds decisive. But it erases the neutral, the partly-agreed, the "with you on this, not on that." The two doors are real — the claim that they\'re the only doors is the trick. That move has a name: the false dilemma.',
      source: 'A rhetorical staple from Cicero to modern politics',
      emoji: '🗳️',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-12',
      quote: 'Mankind likes to think in terms of extreme opposites. It is given to formulating its beliefs in terms of Either-Or, between which it recognizes no intermediate possibilities.',
      author: 'John Dewey',
      era: '1938',
      work: 'Experience and Education',
      philosopherId: 'john-dewey',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw a real "or" — and a distraction dodge.',
      body: 'A logical disjunction (P or Q) can be perfectly true when the options truly cover the field. And like ad hominem, this is another way arguments cheat — not by dodging the point, but by narrowing your choices until only two remain.',
      emoji: '🔗',
    },
    {
      type: 'question',
      prompt: '"You\'re either with us or against us" forces a real choice, so it is sound reasoning.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'This is the false dilemma (false dichotomy). It suppresses real options — neutral, partly with, partly against — so the "forced" choice is an illusion. A disjunction is only legitimate when its alternatives are actually exhaustive; here they are not.',
      },
    },
    {
      type: 'summary',
      title: 'Both Doors Named',
      keyPoints: [
        'False dilemma offers two options, hides the rest',
        'A real "or" must be genuinely exhaustive',
        'Ask: is there a third door, or a middle?',
        'It rigs a real choice into a fake trap',
      ],
      closingThought: 'You now know two ways arguments cheat — dodging the point, and narrowing your doors. Watch for both.',
    },
  ],
};

export default lesson;
