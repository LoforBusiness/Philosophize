import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-2',
  slug: 'everyday-moral-choices',
  title: 'The Three Lenses of Ethics',
  description: 'Philosophy offers three great ways to ask "what is right?" — outcomes, duties, and character. Meet the thinkers behind each.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Three philosophers, three answers to "what is right?"',
      subtext: 'Mill, Kant, and Aristotle each cracked ethics open a different way.',
      emoji: '⚖️',
    },
    {
      type: 'concept',
      title: 'Normative Ethics',
      body: 'Normative ethics asks how we ought to act. Three theories dominate. Consequentialism judges actions by their outcomes. Deontology judges them by duties and rules. Virtue ethics judges the character behind them. Each is a lens. Point it at any choice and a different answer snaps into focus.',
      visual: '🔭',
      highlight: 'normative ethics',
    },
    {
      type: 'example',
      title: 'Mill and the Greatest Happiness',
      scenario: 'John Stuart Mill, building on Jeremy Bentham, championed utilitarianism. His test is blunt and bold: an act is right if it produces the greatest happiness for the greatest number. Pleasure counts up, suffering counts down, and the action with the best total wins. Outcomes are everything. Intentions and rules take a back seat.',
      emoji: '😊',
    },
    {
      type: 'question',
      prompt: 'Which choice does a consequentialist judge purely by its outcomes?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Following a rule because it is your sacred duty', isCorrect: false },
          { id: 'b', text: 'Acting so the result brings the most happiness overall', isCorrect: true },
          { id: 'c', text: 'Doing what a person of fine character would do', isCorrect: false },
          { id: 'd', text: 'Obeying because the law commands it', isCorrect: false },
        ],
        explanation: 'Consequentialism, like Mill\'s utilitarianism, weighs only results. Duty points to Kant, character points to Aristotle, and law is not the same as morality.',
      },
    },
    {
      type: 'example',
      title: 'Kant\'s Iron Rule of Duty',
      scenario: 'Immanuel Kant rejected outcomes entirely. What matters is the rule you act on. His categorical imperative: act only on a principle you could will everyone to follow. Lying fails the test, because a world where all lie destroys trust and meaning. For Kant, duty is absolute. A right act stays right even when it leads nowhere good.',
      emoji: '🧭',
    },
    {
      type: 'concept',
      title: 'Aristotle and the Golden Mean',
      body: 'Virtue ethics asks not "what should I do?" but "who should I become?" Aristotle aimed at eudaimonia, a flourishing life. Virtue sits as the golden mean between extremes: courage between cowardice and recklessness. You grow it through habit. Do brave acts, and you become brave. Character, not calculation, is the heart of ethics.',
      visual: '🌱',
      highlight: 'virtue ethics',
    },
    {
      type: 'question',
      prompt: 'Hume argued you cannot derive what you ought to do purely from facts about what is.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'This is Hume\'s is–ought gap. He noticed that no pile of factual claims about how the world is logically yields a moral claim about how it ought to be. Values need more than facts alone.',
      },
    },
    {
      type: 'summary',
      title: 'Three Lenses on the Good',
      keyPoints: [
        'Consequentialism: Mill judges by outcomes',
        'Deontology: Kant judges by duty',
        'Virtue ethics: Aristotle judges by character',
        'Hume: facts alone cannot yield an ought',
      ],
      closingThought: 'Master all three lenses, and no moral problem looks flat again.',
    },
  ],
};

export default lesson;
