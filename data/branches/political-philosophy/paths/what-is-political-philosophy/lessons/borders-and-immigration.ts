import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-29',
  slug: 'borders-and-immigration',
  title: 'May A State Close Its Doors?',
  description: 'Where you are born shapes your whole life. Can a state justly keep outsiders out?',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'The luckiest thing that ever happened to you may be where you were born.',
      subtext: 'And it was pure chance. So may a state lock its border against those born elsewhere?',
      emoji: '🛂',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you asked what we owe people beyond our borders.',
      body: 'In Global Justice you weighed duties that cross frontiers. Immigration sharpens the question: it is no longer abstract aid, but a real person at the gate, asking to come in.',
      emoji: '🌍',
    },
    {
      type: 'concept',
      title: 'The Case For Open Borders',
      body: 'Citizenship, Carens argues, is the modern equivalent of feudal privilege: an inherited status that hugely shapes your life chances, assigned by the accident of birth. If we reject birth privilege at home, why accept it at the border? Justice, on this view, leans toward freedom of movement.',
      visual: '🚪',
      highlight: 'birthright privilege',
    },
    {
      type: 'quote',
      id: 'lq-political-political-29-1',
      quote: 'Citizenship in Western liberal democracies is the modern equivalent of feudal privilege, an inherited status that greatly enhances one\'s life chances.',
      author: 'Joseph Carens',
      era: '1987',
      work: 'Aliens and Citizens',
    },
    {
      type: 'concept',
      title: 'The Case For Closure',
      body: 'A community, Walzer answers, is partly defined by its power to admit. Like a club or a family, a political community must decide who joins to preserve its shared culture and self-government. Without some control over membership, "we the people" loses meaning entirely.',
      visual: '🏛️',
      highlight: 'self-determination',
    },
    {
      type: 'example',
      title: 'The Two Newborns',
      scenario: 'Two babies are born the same day, one inside a wealthy democracy, one just across its border in poverty. Neither did anything to deserve their side of the line. One will likely enjoy schools, safety, and opportunity; the other, far less. The border, drawn before either could choose, will shape both lives more than almost anything they ever do.',
      source: 'A standard framing in the immigration debate',
      emoji: '👶',
    },
    {
      type: 'question',
      prompt: 'Carens compares modern citizenship to feudal privilege mainly to make which point?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Life chances assigned by birth alone are hard to justify', isCorrect: true },
          { id: 'b', text: 'Modern states should restore literal feudal lords', isCorrect: false },
          { id: 'c', text: 'Citizens of democracies are like medieval serfs', isCorrect: false },
          { id: 'd', text: 'All borders have already been abolished', isCorrect: false },
        ],
        explanation: 'Answers (b) and (c) take the analogy too literally. The argument is normative: we reject inherited privilege within societies, so an honest liberalism should be uneasy that a birth lottery at the border decides so much.',
      },
    },
    {
      type: 'dilemma',
      scenario: 'A prosperous democracy debates its border. Opening it would give millions a fairer shot at a decent life. Closing it lets citizens control who shares in their language, institutions, and welfare state. Both sides claim the language of justice.',
      prompt: 'May the state justly restrict immigration?',
      choices: [
        { id: 'a', label: 'No, free movement is a basic claim of justice' },
        { id: 'b', label: 'Yes, communities may decide their own membership' },
        { id: 'c', label: 'Restrict, but with strong duties to refugees' },
      ],
      views: [
        {
          thinker: 'Joseph Carens',
          stance: 'Borders should be largely open',
          why: 'If we believe in equal moral worth, restricting movement mostly protects the unearned advantages of the already-fortunate. Freedom to move is, for many, the difference between a flourishing life and a blighted one.',
        },
        {
          thinker: 'Michael Walzer',
          stance: 'Self-determining communities may close the door',
          why: 'The right to shape a shared way of life requires the right to admit. A community with no control over membership cannot sustain the bonds, culture, and mutual obligations that make it a community at all.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'The Gate And Its Keepers',
      keyPoints: [
        'Birthplace shapes life chances by sheer luck',
        'Open borders: reject privilege assigned by birth',
        'Closed borders: communities may choose members',
        'Refugees press hardest on any closure case',
      ],
      closingThought: 'If you would not pick your neighbors by birthright at home, what justifies it at the border?',
    },
  ],
};

export default lesson;
