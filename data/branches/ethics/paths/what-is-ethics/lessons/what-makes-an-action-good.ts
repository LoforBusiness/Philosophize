import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-3',
  slug: 'what-makes-an-action-good',
  title: 'What Makes an Action Good?',
  description: 'Meet the three great theories of ethics — outcomes, duty, and character — and watch them clash over a single life-or-death choice.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'One choice. Three philosophers. Three verdicts.',
      subtext: 'Same dilemma, same goal — do right — yet they split. Why?',
      emoji: '🔥',
    },
    {
      type: 'dilemma',
      scenario:
        'A runaway trolley hurtles toward five people tied to the track. Your hand rests on a lever. Pull it, and the trolley swerves onto a side track — where one person stands, who dies instead. Philippa Foot first posed this kind of dilemma in 1967; Judith Jarvis Thomson added the bystander-at-the-lever version you see here.',
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
          why: 'For Mill, the right act is the one that promotes the most happiness, counting each person equally. Five lives saved outweigh one lost — so pull.',
        },
        {
          thinker: 'Immanuel Kant',
          stance: 'would not sacrifice the one',
          why: 'Kant forbade treating a person merely as a means. Killing one to spare five does exactly that. Duty binds, whatever follows.',
        },
        {
          thinker: 'Aristotle',
          stance: 'asks what a good person does',
          why: 'Aristotle eyed character, not the act alone. What would a person of practical wisdom do here — and who do you become by choosing it?',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'concept',
      title: 'Three Ways to Judge an Action',
      body: 'Ask what makes an act good and philosophy hands you three answers. Consequentialism looks forward, to outcomes: did good result? Deontology looks to duty: was a moral rule honored? Virtue ethics looks inward, to character: is this what an excellent person would do? Three lenses, three rival traditions — each catching something real, each with a blind spot.',
      visual: '⚖️',
      highlight: 'consequentialism, deontology, virtue ethics',
    },
    {
      type: 'example',
      title: 'Theory 1: Judge by the Outcome',
      scenario: 'Consequentialism weighs an act by what it brings about. Bentham built utilitarianism on the principle of utility — approve acts that increase happiness, the only thing good in itself. Mill refined it: some pleasures (thought, art) rank higher than others. Everyone\'s happiness counts equally, and the deed is judged by its ripples, not the motive behind it.',
      source: 'Jeremy Bentham, An Introduction to the Principles of Morals and Legislation (1789); John Stuart Mill, Utilitarianism (1863)',
      emoji: '📊',
    },
    {
      type: 'example',
      title: 'Theory 2: Honor the Duty',
      scenario: 'Deontology says some acts are right or wrong in themselves, outcomes be damned. Kant\'s categorical imperative: act only on a maxim you could will to become a universal law. His own test case is the false promise — if everyone broke promises when handy, promising itself would self-destruct, since no one could trust a word. Duty first.',
      source: 'Immanuel Kant, Groundwork of the Metaphysics of Morals (1785)',
      emoji: '📜',
    },
    {
      type: 'example',
      title: 'Theory 3: Become the Good Person',
      scenario: 'Virtue ethics flips the question: not "what should I do?" but "who should I be?" Aristotle prized eudaimonia — flourishing, not mere good feeling — built from virtues like courage. A virtue is a mean between extremes: courage sits between cowardice and recklessness. But not everything has a mean — some acts, like murder, are simply wrong. Forge character through habit, and right action follows.',
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
        explanation: 'Consequentialism — and its famous form, utilitarianism — pins an action\'s worth entirely on its results, above all how much happiness it produces.',
      },
    },
    {
      type: 'question',
      prompt: 'Kant believed that lying remains wrong even when it would save a life.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'In "On a Supposed Right to Lie from Philanthropy" (1797), Kant argued you may not lie even to a murderer asking where your friend hides. It is his most criticized verdict — few defend it today.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Three theories, one normative ethics.',
      body: 'Consequentialism, deontology, virtue ethics — these are the three pillars of normative ethics, the branch asking how we ought to act. They sit apart from metaethics (what does "good" even mean?) and applied ethics (war, lying, the trolley). Three rival answers to one ancient question: what makes an action good?',
      emoji: '🧰',
    },
    {
      type: 'summary',
      title: 'Three Lenses on Moral Action',
      keyPoints: [
        'Consequentialism: judge actions by their outcomes',
        'Deontology: duty binds whatever the outcome',
        'Virtue ethics: good acts flow from good character',
        'These three pillars form normative ethics',
      ],
      closingThought: 'Next hard choice, run all three lenses — outcome, duty, character — and watch where they agree and clash.',
    },
  ],
};

export default lesson;
