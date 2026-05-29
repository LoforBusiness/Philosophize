import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-3',
  slug: 'what-makes-an-action-good',
  title: 'What Makes an Action Good?',
  description: 'Meet the three great theories of ethics — consequences, duties, and character — and see how they clash.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Three philosophers walk into a burning building.',
      subtext: 'They each decide differently — and they\'re all trying to be moral.',
      emoji: '🔥',
    },
    {
      type: 'dilemma',
      scenario:
        'A runaway trolley is about to kill five people tied to the track. You stand beside a lever. Pull it, and the trolley switches to a side track — where it will kill one person instead.',
      prompt: 'What do you do?',
      choices: [
        { id: 'pull', label: 'Pull the lever' },
        { id: 'nothing', label: 'Do nothing' },
        { id: 'other', label: 'Find another way' },
      ],
      views: [
        {
          thinker: 'John Stuart Mill',
          stance: 'would pull the lever',
          why: 'A consequentialist counts outcomes: five lives saved outweigh one lost. The greatest good for the greatest number makes pulling the lever the right choice.',
        },
        {
          thinker: 'Immanuel Kant',
          stance: 'would refuse to use the one as a means',
          why: 'For Kant, deliberately sacrificing a person treats them as a mere tool, not an end in themselves. Some duties hold no matter the outcome.',
        },
        {
          thinker: 'Aristotle',
          stance: 'would ask what a good person does',
          why: 'Virtue ethics shifts the question from the act to the agent: what would a wise, courageous, compassionate person do — and who do you become by choosing it?',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'concept',
      title: 'Three Ways to Judge an Action',
      body: 'Philosophers have proposed three main answers to "what makes an action good?" The first looks at outcomes: did it produce good results? The second looks at rules: did you follow the right duties? The third looks at character: is this what a good person would do? Each theory captures something true — and each has limits.',
      visual: '⚖️',
      highlight: 'consequentialism, deontology, virtue ethics',
    },
    {
      type: 'example',
      title: 'Theory 1: It\'s All About Outcomes',
      scenario: 'Consequentialism says an action is good if it produces the best overall consequences. Jeremy Bentham and John Stuart Mill argued we should maximize happiness and minimize suffering. So: is it okay to lie? Only if the lie produces more good than the truth. The outcome is everything — intentions don\'t matter much.',
      source: 'Jeremy Bentham, Introduction to the Principles of Morals and Legislation (1789)',
      emoji: '📊',
    },
    {
      type: 'example',
      title: 'Theory 2: Some Rules Cannot Be Broken',
      scenario: 'Deontology says some actions are right or wrong in themselves — regardless of consequences. Immanuel Kant argued you should only act on rules you could will everyone to follow. Lying is wrong even if it helps someone. Why? Because a world where everyone lies whenever convenient collapses into chaos. Duty comes first.',
      source: 'Immanuel Kant, Groundwork of the Metaphysics of Morals (1785)',
      emoji: '📜',
    },
    {
      type: 'example',
      title: 'Theory 3: Be a Good Person',
      scenario: 'Virtue ethics asks not "what should I do?" but "what kind of person should I be?" Aristotle argued that a virtuous person — honest, courageous, just — will naturally act well. Rather than calculating outcomes or consulting rules, you develop good character through habit and practice. Good actions flow from a good character.',
      source: 'Aristotle, Nicomachean Ethics (c. 350 BCE)',
      emoji: '🌟',
    },
    {
      type: 'question',
      prompt: 'Which ethical theory judges actions purely by their outcomes?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Virtue ethics', isCorrect: false },
          { id: 'b', text: 'Deontology', isCorrect: false },
          { id: 'c', text: 'Consequentialism', isCorrect: true },
          { id: 'd', text: 'Moral relativism', isCorrect: false },
        ],
        explanation: 'Consequentialism holds that the moral worth of an action is determined entirely by its consequences — specifically, whether it maximizes good outcomes like happiness.',
      },
    },
    {
      type: 'question',
      prompt: 'Kant believed lying is wrong even when it would save a life.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Kant held that lying is always wrong because it violates a universal duty — you could not will a world where everyone lies whenever convenient. This is one of deontology\'s most controversial implications.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'You\'ve now met all three major ethical frameworks.',
      body: 'Most people use all three frameworks without realising it. You calculate consequences when deciding whether to call in sick. You follow duties when you return a found wallet. You ask "what would a good person do?" when you\'re genuinely unsure. Ethics isn\'t just one theory — it\'s a toolkit.',
      emoji: '🧰',
    },
    {
      type: 'summary',
      title: 'Three Lenses on Moral Action',
      keyPoints: [
        'Consequentialism: good actions produce the best outcomes',
        'Deontology: some duties must be followed regardless of outcomes',
        'Virtue ethics: good actions flow from good character',
        'Most moral thinking draws on all three frameworks',
      ],
      closingThought: 'The next time you face a hard choice, try on all three lenses — you might be surprised where they lead.',
    },
  ],
};

export default lesson;
