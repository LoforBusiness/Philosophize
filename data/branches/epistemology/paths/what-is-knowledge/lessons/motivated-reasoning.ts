import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-28',
  slug: 'motivated-reasoning',
  title: 'The Lawyer In Your Head',
  description: 'Sometimes your mind isn’t seeking the truth. It’s defending a verdict it already wants.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Your mind isn’t always a scientist. Sometimes it’s a lawyer.',
      subtext: 'A scientist follows the evidence. A lawyer already knows the verdict and builds the case.',
      emoji: '⚖️',
    },
    {
      type: 'example',
      title: 'Two Studies, Two Standards',
      scenario:
        'A study says your favorite habit is harmful. You scrutinize it: small sample, shaky method, who funded it? A second study says the habit is fine. You nod and share it—no scrutiny at all. Same quality of evidence, wildly different standards. The deciding factor was not the data. It was what you wanted to be true.',
      emoji: '🔬',
    },
    {
      type: 'concept',
      title: 'Motivated Reasoning',
      body: 'Motivated reasoning is thinking aimed at reaching a desired conclusion rather than an accurate one. You raise the bar for unwelcome evidence ("can I dismiss this?") and lower it for welcome evidence ("can I believe this?"). It feels exactly like honest reasoning from the inside—which is what makes it dangerous.',
      visual: '🎭',
      highlight: 'motivated reasoning',
    },
    {
      type: 'concept',
      title: 'Why It Hides',
      body: 'Motivated reasoning rarely announces itself. You do not feel biased; you feel right. The wanting steers which questions you ask, which sources you trust, when you stop looking. Because the verdict came first and the reasons were recruited after, the conclusion feels earned even though the search was rigged.',
      visual: '🫥',
      highlight: 'asymmetric scrutiny',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-28-1',
      quote: 'The first principle is that you must not fool yourself—and you are the easiest person to fool.',
      author: 'Richard Feynman',
      era: '1974',
      work: '"Cargo Cult Science" address',
    },
    {
      type: 'reinforcement',
      callout: 'This is the enemy of honest updating.',
      body: 'Earlier you were asked to update on the evidence; you prized intellectual humility. Motivated reasoning sabotages both from the inside. It lets you feel open-minded while quietly grading the evidence by how much you like the answer.',
      emoji: '🔁',
    },
    {
      type: 'question',
      prompt: 'A good test for motivated reasoning is: "Am I asking can I believe this, or must I believe this?" Why does that help?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It exposes whether you’re scrutinizing evidence evenly or by preference', isCorrect: true },
          { id: 'b', text: 'It guarantees you will always reach the true conclusion', isCorrect: false },
          { id: 'c', text: 'It proves your desired belief was right all along', isCorrect: false },
          { id: 'd', text: 'It means you should believe whatever is hardest to accept', isCorrect: false },
        ],
        explanation:
          'Option (d) is the tempting trap—overcorrecting into contrarianism, as if the painful belief is always the true one. That’s just motivated reasoning flipped upside down. The real value of the test is symmetry: it catches you applying easy "can I?" standards to welcome claims and harsh "must I?" standards to unwelcome ones. The goal is even scrutiny, not reflexive self-punishment.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Motivated reasoning chases a wanted conclusion',
        'It scrutinizes unwelcome evidence, waves welcome through',
        'From inside, it feels like honest thinking',
        'Test: "can I?" versus "must I?" believe this',
      ],
      closingThought: 'The hardest bias to catch is the one wearing your own reasoning as a disguise. Suspect yourself most when you feel most certain.',
    },
  ],
};

export default lesson;
