import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-16',
  slug: 'marx-alienation',
  title: 'Marx and the Stolen Self',
  description: 'Why Marx said wage labor can leave you a stranger to your own work, and yourself.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You clock in, and somehow clock out of yourself.',
      subtext: 'Marx thought work under capitalism could make you a stranger to your own life.',
      emoji: '🏭',
    },
    {
      type: 'example',
      title: 'On the Assembly Line',
      scenario: 'You fit the same bolt, all day, to a car you will never own and could never afford. The boss sets the pace; the company keeps the product. The work is not yours, the thing is not yours, and the day feels like time merely survived, not lived.',
      emoji: '🔩',
    },
    {
      type: 'concept',
      title: 'The Four Estrangements',
      body: 'Marx called this alienation: the worker is severed from the product (owned by another), from the act of working (forced, monotonous), from human nature (creativity stifled), and from other people. The cause is structural, who owns and controls labor, not merely a bad manager.',
      visual: '⛓️',
      highlight: 'alienation',
    },
    {
      type: 'quote',
      id: 'lq-political-political-16-1',
      quote: 'The worker therefore only feels himself outside his work, and in his work feels outside himself.',
      author: 'Karl Marx',
      era: '1844',
      work: 'Economic and Philosophic Manuscripts',
      philosopherId: 'karl-marx',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you asked: equality of what, and who may own?',
      body: 'Earlier lessons weighed equal rights against equal wealth, and debated who may justly own. Marx digs beneath both, attacking ownership of the means of production itself, the fixed background those debates took for granted.',
      emoji: '🧩',
    },
    {
      // The cinematic scene asks this one on the stage, by tapping which of the four
      // cords a paced production line severs (E37c).
      type: 'question',
      prompt: 'The line sets the pace and you cannot stop it. Which of the four severings is that?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'From the act of working itself', isCorrect: true },
          { id: 'b', text: 'From the product you made', isCorrect: false },
          { id: 'c', text: 'From the other workers beside you', isCorrect: false },
        ],
        explanation: 'Not being able to set your own pace estranges you from the activity while you are inside it — the day becomes time survived rather than lived. Severance from the product is a separate cord, and it is cut by who owns the thing rather than by how fast the line runs. Keeping the four apart is what stops alienation collapsing into "a bad job".',
      },
    },
    {
      type: 'question',
      prompt: 'A friend says: "Alienation just means low pay, so a big enough raise would cure it." Where does this go wrong?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It is right; alienation is simply being underpaid', isCorrect: false },
          { id: 'b', text: 'It reduces a structural estrangement to a mere pay problem', isCorrect: true },
          { id: 'c', text: 'Marx never linked alienation to work at all', isCorrect: false },
          { id: 'd', text: 'A raise would in fact end every form of alienation', isCorrect: false },
        ],
        explanation: 'The trap is reductionism, collapsing a many-sided idea into one familiar piece. For Marx, alienation is about who owns and controls labor; the worker stays severed from product, process, and others. A raise inside that same structure leaves the estrangement untouched.',
      },
    },
    {
      type: 'quote',
      id: 'lq-political-political-16-1-2',
      quote: 'The history of all hitherto existing society is the history of class struggles.',
      author: 'Karl Marx',
      era: '1848',
      work: 'The Communist Manifesto',
      philosopherId: 'karl-marx',
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Alienation is structural, not just low pay',
        'Severed from product, work, self, and others',
        'Marx targets ownership of the means of production',
        'A raise alone leaves the estrangement intact',
      ],
      closingThought: 'For Marx, free people make things; alienated people only make a living.',
    },
  ],
};

export default lesson;
