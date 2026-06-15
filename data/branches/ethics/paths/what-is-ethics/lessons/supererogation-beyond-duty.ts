import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-29',
  slug: 'supererogation-beyond-duty',
  title: 'Above And Beyond The Call',
  description: 'Some good acts are required. Others are heroic gifts you could decline without blame.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A soldier dives on a grenade to save his squad.',
      subtext: 'We call it heroic. But would we blame him if he hadn’t? That gap has a name.',
      emoji: '🎖️',
    },
    {
      type: 'concept',
      title: 'Beyond Duty',
      body: 'A supererogatory act is morally good but not required: praiseworthy if done, yet not blameworthy if omitted. It goes above and beyond the call of duty. The hero who sacrifices himself does more than morality demands. We honor it precisely because it was a gift, not an obligation.',
      visual: '✨',
      highlight: 'praiseworthy but not required',
    },
    {
      type: 'example',
      title: 'Saint, Hero, And The Rest Of Us',
      scenario: 'Three people pass a charity drive. One gives a small, fair donation — meeting an ordinary duty. One quietly donates a kidney to a stranger — a saintly act far beyond any requirement. One walks past, giving nothing this time. We praise the second lavishly, expect the first, and may not even blame the third. Three tiers of moral response.',
      emoji: '🫀',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-29-1',
      quote: 'It seems that we should not so quickly assume that morality always requires us to do as much good as we possibly can.',
      author: 'Susan Wolf',
      era: '1982',
      work: 'Moral Saints',
    },
    {
      type: 'concept',
      title: 'Why It’s Awkward For Some Theories',
      body: 'Strict utilitarianism says always do the most good possible. But then the kidney donation isn’t a generous extra — it’s your plain duty, and refusing is wrong. That seems to erase the whole category of "above and beyond." If everything good is required, nothing can be supererogatory.',
      visual: '⚠️',
      highlight: 'if everything good is required',
    },
    {
      type: 'question',
      prompt: 'Why does treating "always maximize good" as strict duty struggle to make sense of heroism?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It makes heroism impossible because nothing is ever good', isCorrect: false },
          { id: 'b', text: 'It turns heroic sacrifice into mere duty, so omitting it becomes blameworthy', isCorrect: true },
          { id: 'c', text: 'It says heroes should be punished', isCorrect: false },
          { id: 'd', text: 'It proves utilitarianism is meaningless', isCorrect: false },
        ],
        explanation: 'Option A is the tempting trap: it overshoots into nonsense. The theory does not deny that acts are good. The real tension is subtler: if you are always obligated to do the most good, then diving on a grenade is just doing your duty, and anyone who fails to make such sacrifices is acting wrongly. That swallows the special admiration we reserve for going beyond duty — the category of supererogation collapses.',
      },
    },
    {
      type: 'dilemma',
      scenario: 'A wealthy person gives a steady, fair share to good causes and lives a full, ordinary life with hobbies and friends. A critic says that since she could do much more good by giving nearly everything away, she is failing her duty and her comfortable life is a moral indulgence.',
      prompt: 'Is giving "a fair share" enough, or is more required?',
      choices: [
        { id: 'a', label: 'A fair share fulfills her duty; the rest is optional' },
        { id: 'b', label: 'She is obligated to give until it really hurts' },
      ],
      views: [
        {
          thinker: 'Defender of supererogation',
          stance: 'A fair share is duty; more is a gift.',
          why: 'Morality leaves space for a life of one’s own — projects, friendships, rest. Giving beyond a reasonable share is admirable, even saintly, but not owed. Praising the extra makes sense only if it was never strictly required.',
        },
        {
          thinker: 'Strict consequentialist',
          stance: 'You must do the most good you can.',
          why: 'If a luxury matters less than a life you could save, keeping it is a moral failure, not a harmless choice. The cozy line between "duty" and "extra" is a comfortable fiction we tell to excuse ourselves.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Supererogation: good but not required acts',
        'Praiseworthy to do, not blameworthy to omit',
        'Heroes and saints act beyond duty',
        'Strict "maximize good" theories struggle to allow it',
      ],
      closingThought: 'A morality with no room for the heroic gift may demand too much — or admire too little.',
    },
  ],
};

export default lesson;
