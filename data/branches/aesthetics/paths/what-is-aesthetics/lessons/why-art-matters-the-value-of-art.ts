import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-20',
  slug: 'why-art-matters-the-value-of-art',
  title: 'So Why Does Art Matter?',
  description: 'The capstone: pulling the whole path together to ask what art is actually for.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Funding is tight. Why pay for art at all?',
      subtext: 'No one starves without a symphony. So what is art actually for?',
      emoji: '🎭',
    },
    {
      type: 'concept',
      title: 'Three Answers, One Question',
      body: 'Why does art matter? Aristotle says it teaches us and refines our feelings. Tolstoy says it binds people through shared emotion. Nietzsche says it makes life itself bearable. Same question — three very different stakes.',
      visual: '🧭',
      highlight: 'the value of art',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw these threads.',
      body: 'You met Tolstoy on art and morality, Aristotle and Hume on tragedy and catharsis, and the clash of beauty versus meaning. This capstone gathers them to ask one question: what is all of it for?',
      emoji: '🧵',
    },
    {
      type: 'example',
      title: 'Catharsis, Revisited',
      scenario: 'Recall Aristotle on tragedy: watching Oedipus fall, we feel pity and fear — then a cleansing release, catharsis. For Aristotle that is art\'s gift: it does not just entertain, it trains and clarifies emotion, teaching us how to feel rightly about a hard world.',
      source: 'Aristotle, Poetics',
      emoji: '🎬',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-20-1',
      quote: 'It is only as an aesthetic phenomenon that existence and the world are eternally justified.',
      author: 'Friedrich Nietzsche',
      era: '1872',
      work: 'The Birth of Tragedy',
      philosopherId: 'friedrich-nietzsche',
    },
    {
      type: 'dilemma',
      scenario: 'A friend asks, point blank: "Why should anyone fund art? People need food and roads, not paintings." You think back over the whole path. Three voices answer in your head — Aristotle, Tolstoy, and Nietzsche — each defending art\'s worth on completely different ground.',
      prompt: 'Which case for art do you find most convincing?',
      xpValue: 5,
      choices: [
        { id: 'a', label: 'It teaches us and refines how we feel' },
        { id: 'b', label: 'It unites people through shared feeling' },
        { id: 'c', label: 'It justifies existence itself' },
      ],
      views: [
        {
          thinker: 'Aristotle',
          stance: 'Art has cognitive and emotional value',
          why: 'Through tragedy and catharsis, art teaches us and refines feeling. We rehearse pity and fear safely, learning to feel rightly. Art is a kind of education of the emotions, not idle decoration.',
        },
        {
          thinker: 'Leo Tolstoy',
          stance: 'Art\'s value is moral and social',
          why: 'Art transmits feeling from one heart to many, uniting people in a shared emotion. Its worth is the human solidarity it creates — art that fails to connect us, however clever, has failed.',
        },
        {
          thinker: 'Friedrich Nietzsche',
          stance: 'Art makes existence bearable',
          why: 'Life is full of suffering with no built-in meaning. Art is how we redeem it — only as an aesthetic phenomenon is existence justified. Art is not a luxury but our deepest answer to despair.',
        },
      ],
    },
    {
      type: 'question',
      prompt: 'A friend says: "Nietzsche calls art a luxury we enjoy once survival is handled." Assess this reading.',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Right — for Nietzsche art is pleasant but inessential', isCorrect: false },
          { id: 'b', text: 'Wrong — he calls art what justifies existence, not an extra', isCorrect: true },
          { id: 'c', text: 'Right — Nietzsche ranked food and safety above all art', isCorrect: false },
          { id: 'd', text: 'Wrong — because Nietzsche thought art had no real value', isCorrect: false },
        ],
        explanation: 'The trap is a framing bias: it smuggles in the "necessities first, art later" hierarchy Nietzsche rejects. For him existence is justified only as an aesthetic phenomenon — so art is foundational, not a leftover luxury.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Aristotle: art teaches and refines emotion',
        'Tolstoy: art unites us through shared feeling',
        'Nietzsche: art justifies existence itself',
      ],
      closingThought: 'Art may matter not for one reason, but for all three at once.',
    },
  ],
};

export default lesson;
