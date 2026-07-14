import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-3',
  slug: 'what-makes-an-action-good',
  title: 'What Makes an Action Good?',
  description: 'Three great theories of ethics clash over one life-or-death choice.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'One choice. Three philosophers. Three verdicts.',
      subtext: 'Same dilemma, same goal, yet they split. Why?',
      emoji: '🔥',
    },
    {
      type: 'dilemma',
      scenario:
        'A runaway trolley hurtles toward five people tied to the track. Your hand rests on a lever. Pull it, and the trolley swerves onto a side track, where one person stands and dies instead. Philippa Foot first posed this kind of dilemma in 1967.',
      prompt: 'What do you do?',
      choices: [
        { id: 'pull', label: 'Pull the lever' },
        { id: 'nothing', label: 'Do nothing' },
        { id: 'other', label: 'Look for another way' },
      ],
      views: [
        {
          thinker: 'John Stuart Mill',
          stance: 'would pull the lever',
          why: 'The right act promotes the most happiness, counting each person equally. Five lives saved outweigh one lost, so pull.',
        },
        {
          thinker: 'Immanuel Kant',
          stance: 'would not sacrifice the one',
          why: 'Kant refused to trade lives like sums. The one on the side track has a dignity no arithmetic outweighs. Duty binds, whatever follows.',
        },
        {
          thinker: 'Aristotle',
          stance: 'asks what a good person does',
          why: 'Aristotle eyed character, not the act alone. What would a person of practical wisdom do, and who do you become by choosing it?',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'concept',
      title: 'Three Ways to Judge an Action',
      body: 'Philosophy hands you three answers. Consequentialism looks to outcomes: did good result? Deontology looks to duty: was a rule honored? Virtue ethics looks to character: what would an excellent person do?',
      visual: '⚖️',
      highlight: 'consequentialism, deontology, virtue ethics',
    },
    {
      type: 'example',
      title: 'Theory 1: Judge by the Outcome',
      scenario: 'Consequentialism weighs an act by what it brings about. Bentham built utilitarianism: approve acts that increase happiness. Mill added that some pleasures rank higher. Everyone counts equally, judged by ripples, not motive.',
      source: 'J. S. Mill, Utilitarianism (1863)',
      emoji: '📊',
    },
    {
      type: 'example',
      title: 'Theory 2: Honor the Duty',
      scenario: "Deontology says some acts are right or wrong in themselves. Kant's categorical imperative: act only on a maxim you could will to be a universal law. If everyone broke promises when handy, promising itself would self-destruct.",
      source: 'Immanuel Kant, Groundwork (1785)',
      emoji: '📜',
    },
    {
      type: 'example',
      title: 'Theory 3: Become the Good Person',
      scenario: 'Virtue ethics asks not "what should I do?" but "who should I be?" Aristotle prized eudaimonia, flourishing. A virtue is a mean: courage sits between cowardice and recklessness. Forge character through habit.',
      source: 'Aristotle, Nicomachean Ethics (c. 350 BCE)',
      emoji: '🌟',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-3-1',
      quote: 'Act only according to that maxim whereby you can at the same time will that it should become a universal law.',
      author: 'Immanuel Kant',
      era: '1785',
      work: 'Groundwork of the Metaphysics of Morals',
    },
    {
      type: 'question',
      prompt: 'Which theory weighs an action purely by the consequences it brings?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Virtue ethics', isCorrect: false },
          { id: 'b', text: 'Deontology', isCorrect: false },
          { id: 'c', text: 'Consequentialism', isCorrect: true },
          { id: 'd', text: 'Moral relativism', isCorrect: false },
        ],
        explanation: 'Consequentialism, and its famous form utilitarianism, pins an action\'s worth entirely on its results, above all the happiness produced.',
      },
    },
    {
      type: 'question',
      prompt: 'Utilitarians and Kant both say "the end justifies the means." True?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'A utilitarian may let good ends justify the means, but Kant flatly forbids it: never treat a person merely as a means, whatever follows.',
      },
    },
    {
      type: 'summary',
      title: 'Three Lenses on Moral Action',
      keyPoints: [
        'Consequentialism: judge by the outcome',
        'Deontology: duty binds whatever follows',
        'Virtue ethics: good acts, good character',
        'These three pillars form normative ethics',
      ],
      closingThought: 'Next hard choice, run all three lenses, outcome, duty, character, and watch where they clash.',
    },
  ],
};

export default lesson;
