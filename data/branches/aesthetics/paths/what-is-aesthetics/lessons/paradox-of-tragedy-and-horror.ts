import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-17',
  slug: 'paradox-of-tragedy-and-horror',
  title: 'Why We Pay To Be Horrified',
  description: 'We avoid grief and fear in life — so why seek them out in art?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You flee danger in life — but buy a ticket in art.',
      subtext: 'Horror, tragedy, grief — we pay good money to feel them.',
      emoji: '🎭',
    },
    {
      type: 'concept',
      title: 'The Paradox of Tragedy',
      body: 'In life we avoid fear, pity, and disgust. Yet we choose stories that arouse exactly those painful feelings — and enjoy them. How can a real, unpleasant emotion become something we seek out? That puzzle is the paradox of tragedy.',
      visual: '🩸',
      highlight: 'paradox of tragedy',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you met the sublime.',
      body: 'In the sublime lesson, Burke found delight laced with terror at a safe distance. And expression theory showed art carries real feeling. Tragedy pushes both further: here the feeling itself is painful, yet still wanted.',
      emoji: '🌊',
    },
    {
      type: 'example',
      title: "Aristotle's Answer: Catharsis",
      scenario: 'Aristotle watched Athenians weep at tragedies and leave somehow lighter. Tragedy, he argued, arouses pity and fear, then purges and clarifies them — a cleansing release. The painful emotions are not the price of the art; working through them is the point.',
      source: 'Aristotle, Poetics (c. 335 BCE)',
      emoji: '🏛️',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-17-1',
      quote: 'The whole impulse of those passions is converted into pleasure, and swells the delight which the eloquence raises in us.',
      author: 'David Hume',
      era: '1757',
      work: 'Of Tragedy',
      philosopherId: 'david-hume',
    },
    {
      type: 'dilemma',
      scenario: 'It is Friday night. For fun, you scroll past the comedies and pick the most terrifying horror film you can find — knowing it will make your heart pound and your skin crawl. You are choosing to feel afraid.',
      prompt: 'Why does the painful feeling become enjoyable?',
      choices: [
        { id: 'a', label: 'Fear is purged and clarified' },
        { id: 'b', label: 'Artful form turns pain to pleasure' },
        { id: 'c', label: 'Curiosity about the monster drives us' },
      ],
      views: [
        {
          thinker: 'Aristotle',
          stance: 'Catharsis: the emotions are purged.',
          why: 'Tragedy arouses pity and fear, then releases and clarifies them. The discomfort is worked through, leaving a cleansing relief — so the painful feelings serve the experience rather than spoil it.',
        },
        {
          thinker: 'David Hume',
          stance: 'Form converts the passion into pleasure.',
          why: 'The artful eloquence — the beauty of the telling — is so powerful it overtakes the painful passion, converting its very impulse into delight. The pain is not removed; it is transformed by the form.',
        },
        {
          thinker: 'Noël Carroll',
          stance: 'Curiosity about the impossible hooks us.',
          why: 'What draws us is fascination with the impossible monster and the urge to know what happens. The fear is a price we tolerate to satisfy that curiosity, not the thing we enjoy.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'question',
      prompt: 'A friend says: "Real fear is unpleasant, so horror fans must just be faking their enjoyment." Is this right?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes — you cannot truly enjoy a genuinely painful emotion', isCorrect: false },
          { id: 'b', text: 'No — the feeling can be real yet transformed or outweighed by form, catharsis, or curiosity', isCorrect: true },
          { id: 'c', text: 'Yes — fans only pretend to be scared to look brave', isCorrect: false },
          { id: 'd', text: 'No — horror never actually arouses any fear at all', isCorrect: false },
        ],
        explanation: 'The trap is a false dilemma: "either the fear is fake or the enjoyment is." Hume, Aristotle, and Carroll all show a third path — the fear is real, but converted by form, purged through catharsis, or outweighed by curiosity.',
      },
    },
    {
      type: 'summary',
      title: 'Why Pain Can Please',
      keyPoints: [
        'Paradox of tragedy: we seek painful art on purpose',
        'Aristotle: catharsis purges pity and fear',
        'Hume: artful form converts pain to pleasure',
        'Carroll: curiosity about the impossible hooks us',
      ],
      closingThought: 'Negative emotion, reshaped by art, becomes something we willingly pay for.',
    },
  ],
};

export default lesson;
