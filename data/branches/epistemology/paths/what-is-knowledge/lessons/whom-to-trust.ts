import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-19',
  slug: 'whom-to-trust',
  title: 'Whom Should You Believe?',
  description: 'You cannot verify everything yourself. So how do you spot a real expert?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You will never check most of what you know.',
      subtext: 'No one verifies medicine, climate data, and history alone. So trust itself becomes a skill.',
      emoji: '🤝',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw testimony carries most of what we know.',
      body: 'If we must rely on others, the real question is which others. Choosing whom to trust is itself an epistemic act, and you can do it well or badly.',
      emoji: '🧭',
    },
    {
      type: 'concept',
      title: 'Marks of Real Expertise',
      body: 'A novice cannot judge a hard claim directly, but can judge its source. Look for a track record, agreement among independent experts, openness about uncertainty, and no hidden stake in the answer. These are signals, not proofs.',
      visual: '🎓',
      highlight: 'track record',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-19-1',
      quote: 'A wise man proportions his belief to the evidence.',
      author: 'David Hume',
      era: '1748',
      work: 'An Enquiry Concerning Human Understanding',
      philosopherId: 'david-hume',
    },
    {
      type: 'dilemma',
      scenario:
        'On a medical question, ninety-seven specialists who study it agree. One confident maverick disagrees and has a huge following online. You are not a doctor and cannot run the studies yourself. You must decide whom to provisionally trust.',
      prompt: 'Whom should the non-expert provisionally believe?',
      choices: [
        { id: 'consensus', label: 'The broad expert consensus' },
        { id: 'maverick', label: 'The lone confident dissenter' },
        { id: 'neither', label: 'Suspend judgment entirely' },
      ],
      views: [
        {
          thinker: 'Alvin Goldman',
          stance: 'lean toward the consensus',
          why: 'Goldman argued a layperson can weigh experts by track record and by numbers of independent agreement. Many independent specialists converging is strong second-hand evidence.',
        },
        {
          thinker: 'John Stuart Mill',
          stance: 'do not silence the dissenter',
          why: 'Mill warned that even a lone voice may be right, and that testing our views against dissent keeps them alive. Hear the maverick, but never mistake confidence for evidence.',
        },
        {
          thinker: 'David Hume',
          stance: 'proportion belief to evidence',
          why: 'Hume would weigh the maverick’s extraordinary claim against the mass of careful testimony behind it, and tilt belief toward the better-supported side without treating it as final.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-19-2',
      quote: 'He who knows only his own side of the case knows little of that.',
      author: 'John Stuart Mill',
      era: '1859',
      work: 'On Liberty',
      philosopherId: 'john-stuart-mill',
    },
    {
      type: 'reinforcement',
      callout: 'Trust is provisional, not blind.',
      body: 'Leaning on consensus is not worshipping authority. It is a reasonable bet for a non-expert, held open to revision, exactly the fallibilist spirit you met earlier.',
      emoji: '🔓',
    },
    {
      type: 'summary',
      title: 'The Skill of Trusting Well',
      keyPoints: [
        'You must rely on others to know most things',
        'Judge the source: track record and independence',
        'Weigh consensus, but keep hearing dissent',
        'Trust is provisional and proportioned to evidence',
      ],
      closingThought: 'Knowing whom to believe is not gullibility. Done well, it is one of the hardest skills in epistemology.',
    },
  ],
};

export default lesson;
