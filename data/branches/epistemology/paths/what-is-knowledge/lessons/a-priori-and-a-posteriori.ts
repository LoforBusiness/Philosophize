import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-15',
  slug: 'a-priori-and-a-posteriori',
  title: 'What You Know Before You Look',
  description: "Two kinds of knowing, and Kant's surprising third category.",
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You already know 7 + 5 = 12. You never checked.',
      subtext: 'Some truths you grasp without ever stepping outside to look. How?',
      emoji: '🧮',
    },
    {
      type: 'concept',
      title: 'Two Roads to a Truth',
      body: 'Some things you know by experience: snow is cold, the stove burned you. Other things you know without checking: every bachelor is unmarried. Philosophers call the first a posteriori (after experience) and the second a priori (before, or independent of, experience).',
      visual: '🛤️',
      highlight: 'a priori',
    },
    {
      type: 'example',
      title: 'Counting Without Looking',
      scenario: "You don't survey every triangle on Earth to know its angles sum to 180 degrees. You don't poll married men to confirm none are bachelors. You reason it out from the meanings and relations alone. No telescope, no experiment, no field trip. The chair you're sitting on, though? Only experience could tell you it exists.",
      emoji: '📐',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw two rival camps.',
      body: 'Lesson 4 pitted empiricists (all knowledge from experience) against rationalists (some from pure reason). Lesson 12 asked where knowledge sources lie. Kant refused to pick a side — and claimed both were half right.',
      emoji: '🤝',
    },
    {
      type: 'concept',
      title: "Kant's Third Category",
      body: "Kant split truths two ways: analytic ones just unpack a definition ('bachelors are unmarried' adds nothing new). Synthetic ones add real content. He then asked a shocking question: could a truth be synthetic AND a priori — known before experience, yet genuinely informative?",
      visual: '🔑',
      highlight: 'synthetic a priori',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-15',
      quote: 'Though all our knowledge begins with experience, it does not follow that it all arises out of experience.',
      author: 'Immanuel Kant',
      era: '1781',
      work: 'Critique of Pure Reason',
      philosopherId: 'immanuel-kant',
    },
    {
      type: 'concept',
      title: 'Where Mind Meets World',
      body: 'For Kant, 7 + 5 = 12 is synthetic a priori: the answer 12 is not hidden inside the idea of 7, 5, or plus, yet you need no experiment. Such truths arise from structures the mind itself imposes on every experience — space, time, number.',
      visual: '🌉',
      highlight: 'structures the mind imposes',
    },
    {
      type: 'question',
      prompt: "A friend says: 'Knowing 7 + 5 = 12 without an experiment makes it just an empty definition.' Why would Kant disagree?",
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          {
            id: 'a',
            text: 'He wouldn\'t — a priori truths really are empty restatements of definitions.',
            isCorrect: false,
          },
          {
            id: 'b',
            text: 'The concept of 12 is not contained in "7 plus 5," yet it needs no experiment — synthetic a priori.',
            isCorrect: true,
          },
          {
            id: 'c',
            text: 'Math is actually a posteriori — we learn it by counting objects as children.',
            isCorrect: false,
          },
          {
            id: 'd',
            text: 'Kant thought no one can truly know 7 + 5 = 12 at all.',
            isCorrect: false,
          },
        ],
        explanation: "Option A is the tempting trap, and it commits a false dichotomy: it assumes a priori must equal analytic (empty), leaving only two boxes. Kant's whole point is the missed third box — synthetic a priori. The idea of 12 is not packed inside '7 plus 5,' so it adds new content, yet you grasp it without experience. New knowledge, no experiment.",
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'A priori: known independent of experience.',
        'A posteriori: justified by experience.',
        'Analytic just unpacks a definition; synthetic adds content.',
        'Kant: synthetic a priori truths are informative yet pre-experiential.',
      ],
      closingThought: 'Mind and world meet halfway — neither pure reason nor raw experience knows alone.',
    },
  ],
};

export default lesson;
