import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-11',
  slug: 'the-gettier-problem',
  title: 'When True Belief Is Not Enough',
  description: 'A famous three-page paper that broke the definition of knowledge.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You were right. For all the wrong reasons.',
      subtext: 'A true, justified belief that somehow still is not knowledge. One short paper proved it.',
      emoji: '🧩',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you assembled the recipe for knowledge.',
      body: 'Knowing is more than a lucky guess, and a belief needs justification. Stack them up and you get the classic recipe: knowledge is justified true belief. For two thousand years, that held. Then it leaked.',
      emoji: '🧪',
    },
    {
      type: 'concept',
      title: 'The JTB Recipe',
      body: 'To know something, three things must line up: you believe it, it is true, and you are justified in believing it. Belief, truth, justification. Miss any one and it is not knowledge. The recipe seems airtight. Edmund Gettier found a crack.',
      visual: '🍰',
      highlight: 'justified true belief',
    },
    {
      type: 'example',
      title: 'The Stopped Clock',
      scenario:
        'You glance at the hallway clock. It reads 3:00, and it really is 3:00, so your belief is true. The clock looks reliable, so you are justified. But the clock stopped exactly twelve hours ago. You were right only because you happened to look at the one moment it was accidentally correct.',
      source: "Bertrand Russell's illustration",
      emoji: '🕒',
    },
    {
      type: 'concept',
      title: 'Epistemic Luck',
      body: 'Your clock belief was justified and true, yet it was not knowledge. Why? Pure luck stitched the truth to your reason. The clock did not connect you to the real time; it just happened to match. Knowledge needs a non-accidental link between your justification and the fact.',
      visual: '🎲',
      highlight: 'epistemic luck',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-11-1',
      quote: 'It is possible for a person to be justified in believing a proposition that is in fact false.',
      author: 'Edmund Gettier',
      era: '1963',
      work: 'Is Justified True Belief Knowledge?',
    },
    {
      type: 'question',
      prompt: 'In the stopped-clock case, why is the justified, true belief still not knowledge?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It is true only by luck; reason and fact are not really linked', isCorrect: true },
          { id: 'b', text: 'The belief was false, so it fails the truth condition', isCorrect: false },
          { id: 'c', text: 'The viewer had no reason at all to trust the clock', isCorrect: false },
          { id: 'd', text: 'A stopped clock can never display the correct time', isCorrect: false },
        ],
        explanation:
          'Option (b) is the tempting trap, but it makes a factual slip about the case and ignores epistemic luck: the belief WAS true and you WERE justified. What is missing is the non-accidental connection. You hit the truth by coincidence, not because your reason tracked the fact.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'JTB: knowledge is justified, true belief',
        'Gettier cases satisfy all three yet fail',
        'Epistemic luck severs reason from fact',
        'Knowledge needs a non-accidental link to truth',
      ],
      closingThought: 'The recipe you built over ten lessons just sprang a leak. Being right is not enough; you must be right for the right reason.',
    },
  ],
};

export default lesson;
