import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-6',
  slug: 'trolley-problem-family',
  title: 'The Trolley Problem and Its Cousins',
  description: 'Why a switch feels fine but a shove feels monstrous, for the same math.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Five lives saved. So why does this feel wrong?',
      subtext: 'Same numbers, different hands. Your gut splits where the math does not.',
      emoji: '🚋',
    },
    {
      type: 'concept',
      title: 'One Dilemma, Many Versions',
      body: 'Earlier you met the lever case: divert the trolley, one dies instead of five. Philosophers then twisted it. Each twist keeps the five-for-one math but changes how the one dies.',
      visual: '🔀',
      highlight: 'the trolley family',
    },
    {
      type: 'example',
      title: 'The Footbridge Twist',
      scenario: 'Judith Jarvis Thomson reworked Foot’s puzzle in 1985. Now you stand on a bridge beside a large stranger. Shove him onto the track and his body stops the trolley, saving five. Most who pull the lever refuse to push.',
      source: 'J. J. Thomson, The Trolley Problem (1985)',
      emoji: '🌉',
    },
    {
      type: 'dilemma',
      scenario:
        'Lever case: flip a switch, the trolley kills one instead of five. Footbridge case: push a stranger off a bridge, his body stops it, saving five. The arithmetic is identical, five lives for one. Many say yes to the switch, no to the shove.',
      prompt: 'Is the shove different from the switch?',
      choices: [
        { id: 'same', label: 'No, the math is the same' },
        { id: 'different', label: 'Yes, using him as a tool is worse' },
      ],
      views: [
        {
          thinker: 'Philippa Foot',
          stance: 'distinguishes doing from allowing',
          why: 'Foot held negative duties not to harm outweigh positive duties to help. Diverting redirects a threat; shoving makes a person your instrument.',
        },
        {
          thinker: 'Doctrine of Double Effect',
          stance: 'intention is what matters',
          why: 'A harm foreseen as a side effect may be allowed; a harm used as your means is not. The shove intends his death; the switch does not.',
        },
        {
          thinker: 'Peter Singer',
          stance: 'suspects our gut misfires',
          why: 'A consistent utilitarian counts five over one either way. The recoil at pushing may be a moral instinct that does not track what is right.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-6-1',
      quote: 'It takes more to justify an interference than to justify the withholding of goods and service.',
      author: 'Philippa Foot',
      era: '1984',
      work: 'Killing and Letting Die',
    },
    {
      type: 'question',
      prompt: 'Why do most people permit the switch but refuse the footbridge shove?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The shove uses a person as a means; the switch redirects a threat', isCorrect: true },
          { id: 'b', text: 'The shove kills more people than the switch does', isCorrect: false },
          { id: 'c', text: 'The footbridge case saves fewer than five lives', isCorrect: false },
          { id: 'd', text: 'Pushing is illegal, while flipping a switch is not', isCorrect: false },
        ],
        explanation: 'Both cases trade one life for five. What shifts is treating the stranger as a tool, which the doctrine of double effect and Foot both flag.',
      },
    },
    {
      type: 'question',
      prompt: 'A strict utilitarian must judge the lever and the footbridge cases exactly alike. True?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'It feels off, but pure utilitarianism counts only outcomes: five saved for one lost is identical in both, so the cases get the same verdict.',
      },
    },
    {
      type: 'summary',
      title: 'The Trolley Family',
      keyPoints: [
        'Switch and shove share the same math',
        'Our gut still treats them differently',
        'Means versus side effect drives the split',
        'Foot: not harming outweighs helping',
      ],
      closingThought: 'The puzzle is not what to do, but why our intuitions refuse to line up.',
    },
  ],
};

export default lesson;
