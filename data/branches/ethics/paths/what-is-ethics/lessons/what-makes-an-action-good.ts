import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-3',
  slug: 'what-makes-an-action-good',
  title: 'What Makes an Action Good?',
  description: 'There are three main theories of ethics: outcomes, duties, and character. This lesson explains each and shows how they disagree.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Three philosophers face the same hard choice.',
      subtext: 'Each one decides differently, and each is trying to do the right thing.',
      emoji: '🔥',
    },
    {
      type: 'dilemma',
      scenario:
        'A runaway trolley is heading toward five people tied to the track. Your hand is on a lever. If you pull it, the trolley switches to a side track where one person is standing, who will die instead.',
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
          why: 'Mill judged actions by their outcomes. Five lives saved outweigh one lost, so the choice that produces the most good is to pull the lever.',
        },
        {
          thinker: 'Immanuel Kant',
          stance: 'would not sacrifice the one',
          why: 'Kant said we must never use a person merely as a tool. Deliberately sacrificing someone does exactly that. Some duties hold no matter the outcome.',
        },
        {
          thinker: 'Aristotle',
          stance: 'asks what a good person does',
          why: 'Aristotle focused on character, not the act alone. He would ask what a wise and compassionate person would do here, and who you become by choosing it.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'concept',
      title: 'Three Ways to Judge an Action',
      body: 'When asking what makes an action good, philosophers give three main answers. One looks at outcomes: did it lead to good results? One looks at rules: did it follow the right duties? One looks at character: is this what a good person would do? Each captures something real, and each has weak spots.',
      visual: '⚖️',
      highlight: 'consequentialism, deontology, virtue ethics',
    },
    {
      type: 'example',
      title: 'Theory 1: It\'s All About Outcomes',
      scenario: 'Consequentialism judges an action by its results. Jeremy Bentham and John Stuart Mill said we should increase happiness and reduce suffering. So is lying allowed? Only if the lie leads to more good than telling the truth would. On this view the result is what matters most, not the intention behind it.',
      source: 'Jeremy Bentham, Introduction to the Principles of Morals and Legislation (1789)',
      emoji: '📊',
    },
    {
      type: 'example',
      title: 'Theory 2: Some Rules Cannot Be Broken',
      scenario: 'Deontology says some actions are right or wrong in themselves, regardless of results. Immanuel Kant said we should act only on rules we could want everyone to follow. Lying stays wrong even when it helps, because a world where everyone lies when convenient falls apart. For Kant, duty comes first.',
      source: 'Immanuel Kant, Groundwork of the Metaphysics of Morals (1785)',
      emoji: '📜',
    },
    {
      type: 'example',
      title: 'Theory 3: Be a Good Person',
      scenario: 'Virtue ethics asks not what should I do, but what kind of person should I be? Aristotle thought a person with good character, such as being honest, brave, and fair, naturally tends to act well. Instead of calculating outcomes or checking rules, you build good character through habit and practice, and good actions follow.',
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
        explanation: 'For consequentialism, the value of an action depends entirely on its results, especially whether it produces good outcomes like more happiness.',
      },
    },
    {
      type: 'question',
      prompt: 'Kant believed that lying remains wrong even when it would save a life.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Kant held that lying is always wrong because it breaks a universal duty: you could not want a world where everyone lies when convenient. This is one of deontology\'s most debated conclusions.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Three ethical frameworks, one toolkit.',
      body: 'Most of us use all three without realizing it. You weigh consequences when deciding whether to call in sick. You follow a duty when returning a stranger\'s lost wallet. You ask what a good person would do when you are unsure. Ethics is not one theory but a set of tools.',
      emoji: '🧰',
    },
    {
      type: 'summary',
      title: 'Three Lenses on Moral Action',
      keyPoints: [
        'Consequentialism: judge actions by their outcomes',
        'Deontology: some duties hold whatever the outcome',
        'Virtue ethics: good actions come from good character',
        'Most moral thinking uses all three',
      ],
      closingThought: 'Next time you face a hard choice, try all three lenses and compare the answers.',
    },
  ],
};

export default lesson;
