import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-7',
  slug: 'where-rights-come-from',
  title: 'Where Rights Come From',
  description: 'Are rights woven into nature, or just useful rules we invent?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You have rights. But who handed them to you?',
      subtext: 'Nature? God? Or just a government that could take them back?',
      emoji: '📜',
    },
    {
      type: 'concept',
      title: 'Natural Rights',
      body: 'Locke said some rights are natural: life, liberty, and property belong to you before any government exists. Rulers do not grant them; they exist to protect them, and answer if they fail.',
      visual: '🌱',
      highlight: 'natural rights',
    },
    {
      type: 'quote',
      id: 'lq-political-political-7-1',
      quote: 'Natural rights is simple nonsense: natural and imprescriptible rights, rhetorical nonsense, nonsense upon stilts.',
      author: 'Jeremy Bentham',
      era: '1796',
      work: 'Anarchical Fallacies',
    },
    {
      type: 'concept',
      title: 'Rights as Invented Tools',
      body: 'Bentham scoffed: a right with no law behind it is just a loud wish. For him, real rights are created by law and justified by one thing, the greatest happiness of the greatest number.',
      visual: '🔧',
      highlight: 'created by law',
    },
    {
      type: 'example',
      title: 'Wollstonecraft Extends the Claim',
      scenario: 'Thinkers proclaimed the rights of man, then stopped at men. Mary Wollstonecraft pressed the logic: if rights flow from reason, women reason too, so the same rights must be theirs. Consistency, she argued, demands it.',
      source: 'Mary Wollstonecraft, A Vindication of the Rights of Woman (1792)',
      emoji: '✊',
    },
    {
      type: 'question',
      prompt: 'Why did Bentham call natural rights "nonsense upon stilts"?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Because he thought people deserved no protections at all', isCorrect: false },
          { id: 'b', text: 'Because rights without a real law behind them are empty claims', isCorrect: true },
          { id: 'c', text: 'Because only kings, not nature, can grant rights', isCorrect: false },
          { id: 'd', text: 'Because he believed rights come straight from God', isCorrect: false },
        ],
        explanation: 'Bentham did not oppose protecting people; he denied that rights float free of law. A right, for him, is real only when actual law backs it.',
      },
    },
    {
      type: 'question',
      prompt: 'Bentham mocked natural rights, so surely he was an enemy of all legal rights and reforms. Right?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Yes, Bentham rejected every kind of right outright', isCorrect: false },
          { id: 'b', text: 'No, he prized legal rights and pushed hard for reform', isCorrect: true },
          { id: 'c', text: 'Yes, Bentham opposed all changes to the law', isCorrect: false },
          { id: 'd', text: 'No, because he secretly believed in natural rights', isCorrect: false },
        ],
        explanation: 'The trap: attacking natural rights sounds anti-rights. But Bentham championed legal rights and reform; he just wanted them grounded in law and utility, not in nature.',
      },
    },
    {
      type: 'summary',
      title: 'Two Stories About Rights',
      keyPoints: [
        'Locke: rights are natural, prior to government',
        'Bentham: rights are made by law',
        'Utility, not nature, justifies them for Bentham',
        'Wollstonecraft: the same logic must include women',
      ],
      closingThought: 'How you answer where rights come from decides which ones can be taken away.',
    },
  ],
};

export default lesson;
