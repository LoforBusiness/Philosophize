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
      prompt: "A famous actor endorses a heart medication in an ad. Should that move you?",
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          {
            id: 'a',
            text: 'No — the actor has no relevant medical expertise',
            isCorrect: true,
          },
          {
            id: 'b',
            text: "Yes — they're respected and trustworthy, so it's strong evidence",
            isCorrect: false,
          },
          {
            id: 'c',
            text: 'No — all appeals to authority are fallacies',
            isCorrect: false,
          },
          {
            id: 'd',
            text: 'Yes — a paid endorsement proves the drug works',
            isCorrect: false,
          },
        ],
        explanation:
          "This is the illegitimate appeal to authority (argument from authority). Option B is tempting because fame feels like credibility — but the actor has no cardiology expertise and is paid, so their fame is irrelevant to the medical claim. Option C overcorrects: a relevant, unbiased expert really is good inductive evidence.",
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
