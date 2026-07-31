import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-17',
  slug: 'appeal-to-authority',
  title: 'Who Said So, and Does It Matter?',
  description: "An expert's word can be good evidence, or a fallacy, depending on the fit.",
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: '"Because an expert said so" — proof, or pressure?',
      subtext: 'Sometimes an authority is your best evidence. Sometimes it is just a costume.',
      emoji: '🎓',
    },
    {
      type: 'concept',
      title: 'The Appeal to Authority',
      body: 'Citing an authority is fallacious when the source is irrelevant, biased, fabricated, or speaking outside their field. But citing relevant, unbiased, consensus expertise is reasonable inductive support. The error is misplaced authority — not all authority.',
      visual: '📜',
      highlight: 'misplaced authority',
    },
    {
      type: 'example',
      title: 'The Endorsement',
      scenario: 'A famous actor appears in an ad praising a heart medication. They are charming, respected, and clearly well paid. Compare a cardiologist citing the consensus of clinical trials. Same word — "expert" — but only one of them has relevant, unbiased knowledge of how the drug treats your heart.',
      emoji: '💊',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw ad hominem — and this is its mirror image.',
      body: 'Ad hominem wrongly REJECTS a claim because of who speaks. Misused authority wrongly ACCEPTS a claim because of who speaks. Two sides of the same error: judging the messenger instead of the evidence.',
      emoji: '🪞',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-17',
      quote: 'One of the great commandments of science is: Mistrust arguments from authority.',
      author: 'Carl Sagan',
      era: '1995',
      work: 'The Demon-Haunted World',
    },
    {
      type: 'question',
      prompt: 'Tap the step that does not earn its keep.',
      xpValue: 5,
      interaction: {
        type: 'tap-flaw',
        steps: [
          { id: 's1', text: 'A famous actor endorses this heart medication.' },
          { id: 's2', text: 'He is admired and widely trusted.' },
          { id: 's3', text: 'So his word is good evidence the drug works.' },
        ],
        flawedId: 's3',
        explanation: 'Step 3. Careful here — the lesson is NOT that appeals to authority are always fallacies; a relevant, unbiased expert is genuinely good inductive evidence. The break is that being admired is not being a cardiologist, and he is paid. Fame feels like credibility, which is exactly what the advertisement is buying.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Remember induction from earlier in this path?',
      body: 'A legitimate appeal to authority is inductive support, not proof. Relevant consensus expertise makes a claim LIKELY, not certain. So it can be strong evidence and still be overturned later by better evidence.',
      emoji: '🔬',
    },
    {
      type: 'summary',
      title: 'Authority, Weighed Correctly',
      keyPoints: [
        'Authority fails if irrelevant, biased, fake, or off-field',
        'Relevant consensus expertise is real inductive support',
        'Misused authority mirrors ad hominem — judging the speaker',
        'Even good authority gives likelihood, not certainty',
      ],
      closingThought: "Ask not just \"who said it\" — ask whether they're the right one to know.",
    },
  ],
};

export default lesson;
