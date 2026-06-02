import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-3',
  slug: 'what-makes-an-action-good',
  title: 'What Makes an Action Good?',
  description: 'Meet the three great theories of ethics — consequences, duties, and character — and watch them collide over a single hard choice.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Three philosophers face the same impossible choice.',
      subtext: 'Each one decides differently. And every one of them is trying to be good.',
      emoji: '🔥',
    },
    {
      type: 'dilemma',
      scenario:
        'A runaway trolley hurtles toward five people bound to the track. Your hand rests on a lever. Pull it, and the trolley veers onto a side track — where a single person stands, who will die in their place.',
      prompt: 'What do you do?',
      choices: [
        { id: 'pull', label: 'Pull the lever' },
        { id: 'nothing', label: 'Do nothing' },
        { id: 'other', label: 'Search for another way' },
      ],
      views: [
        {
          thinker: 'John Stuart Mill',
          stance: 'would pull the lever',
          why: 'The consequentialist tallies the outcomes: five lives weighed against one. The greatest good for the greatest number tips the scale, and so the hand must move.',
        },
        {
          thinker: 'Immanuel Kant',
          stance: 'would refuse to make the one a means',
          why: 'To Kant, coldly sacrificing a person reduces them to a tool, never an end in themselves. Certain duties bind us no matter what the outcome may be.',
        },
        {
          thinker: 'Aristotle',
          stance: 'would ask what a good person would do',
          why: 'Virtue ethics turns from the deed to the doer: what would a wise, courageous, compassionate soul choose here — and what kind of person do you become by choosing it?',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'concept',
      title: 'Three Ways to Judge an Action',
      body: 'To the question of what makes an action good, philosophers offer three great answers. One looks to outcomes: did good come of it? Another looks to rules: were the right duties honoured? The third looks to character: is this what a good person would do? Each grasps part of the truth — and each has its blind spots.',
      visual: '⚖️',
      highlight: 'consequentialism, deontology, virtue ethics',
    },
    {
      type: 'example',
      title: 'Theory 1: It\'s All About Outcomes',
      scenario: 'Consequentialism judges an action by the good it leaves in its wake. Jeremy Bentham and John Stuart Mill urged us to swell happiness and shrink suffering. May you lie, then? Only if the lie yields more good than the truth would have. Here the result is everything; the intention behind it counts for little.',
      source: 'Jeremy Bentham, Introduction to the Principles of Morals and Legislation (1789)',
      emoji: '📊',
    },
    {
      type: 'example',
      title: 'Theory 2: Some Rules Cannot Be Broken',
      scenario: 'Deontology insists that some acts are right or wrong in themselves, whatever follows from them. Immanuel Kant said we should act only on rules we could will every person to obey. Lying stays wrong even when it helps — for a world where each of us lies at convenience dissolves into chaos. Duty comes first.',
      source: 'Immanuel Kant, Groundwork of the Metaphysics of Morals (1785)',
      emoji: '📜',
    },
    {
      type: 'example',
      title: 'Theory 3: Be a Good Person',
      scenario: 'Virtue ethics asks not what should I do, but what sort of person should I be? Aristotle held that the virtuous soul — honest, brave, just — acts well as naturally as it breathes. Instead of tallying outcomes or consulting rules, you shape good character through habit and practice. Good deeds simply flow from a good heart.',
      source: 'Aristotle, Nicomachean Ethics (c. 350 BCE)',
      emoji: '🌟',
    },
    {
      type: 'question',
      prompt: 'Which ethical theory weighs an action purely by the consequences it brings?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Virtue ethics', isCorrect: false },
          { id: 'b', text: 'Deontology', isCorrect: false },
          { id: 'c', text: 'Consequentialism', isCorrect: true },
          { id: 'd', text: 'Moral relativism', isCorrect: false },
        ],
        explanation: 'For consequentialism, an action\'s moral worth lies wholly in what it brings about — above all, whether it multiplies good outcomes such as happiness.',
      },
    },
    {
      type: 'question',
      prompt: 'Kant believed that lying remains wrong even when it would save a life.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Kant held lying always wrong, for it breaks a universal duty — you could never will a world in which all lie at convenience. It is among deontology\'s most unsettling conclusions.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You have now met all three of the great ethical frameworks.',
      body: 'Most of us lean on all three without noticing. You weigh consequences when tempted to call in sick. You honour a duty when returning a stranger\'s lost wallet. You ask what a good person would do when truly at sea. Ethics is no single theory — it is a toolkit.',
      emoji: '🧰',
    },
    {
      type: 'summary',
      title: 'Three Lenses on Moral Action',
      keyPoints: [
        'Consequentialism: good actions yield the best outcomes',
        'Deontology: some duties bind whatever the outcome',
        'Virtue ethics: good actions flow from good character',
        'Most moral thinking quietly draws on all three',
      ],
      closingThought: 'Next time a hard choice finds you, try all three lenses — their answers may surprise you.',
    },
  ],
};

export default lesson;
