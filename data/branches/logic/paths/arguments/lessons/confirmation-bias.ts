import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-19',
  slug: 'confirmation-bias',
  title: 'The Mind That Only Hears Yes',
  description: 'We hunt for evidence that we\'re right and quietly ignore everything that says we\'re wrong.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Your brain keeps a scoreboard — and quietly cheats.',
      subtext: 'It counts every hit, forgets every miss, then calls the result proof.',
      emoji: '🎯',
    },
    {
      type: 'concept',
      title: 'Confirmation Bias',
      body: 'Confirmation bias is the pull to seek, favor, and remember evidence that fits what we already believe, while brushing aside what contradicts it. Driven by motivated reasoning, it makes us our own least reliable judge — quietly stacking the deck before we ever ask the question.',
      visual: '🧠',
      highlight: 'confirmation bias',
    },
    {
      type: 'example',
      title: 'Bacon\'s Warning',
      scenario: 'Four centuries ago Francis Bacon noticed how the mind, once it adopts an opinion, drags everything else into agreement. He told the story of a man shown portraits of sailors who prayed and survived shipwrecks — and asked where the portraits were of those who prayed and drowned. The misses leave no record.',
      source: 'Francis Bacon, Novum Organum, 1620',
      emoji: '⛵',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-19',
      quote: 'The human understanding when it has once adopted an opinion draws all things else to support and agree with it.',
      author: 'Francis Bacon',
      era: '1620',
      work: 'Novum Organum',
      philosopherId: 'francis-bacon',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw how evidence can mislead an argument.',
      body: 'Those lessons exposed flaws out in the argument — cherry-picked data, loaded examples. Confirmation bias is the flaw inside the reasoner that makes us pick them. The same mind builds the case and judges it.',
      emoji: '🪞',
    },
    {
      type: 'question',
      prompt: 'You believe a diet works. To test it honestly, what should you most look for?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Cases that would prove you wrong — people it failed', isCorrect: true },
          { id: 'b', text: 'More success stories from people it helped', isCorrect: false },
          { id: 'c', text: 'Reasons the diet is biologically plausible', isCorrect: false },
          { id: 'd', text: 'Testimonials that match your own experience', isCorrect: false },
        ],
        explanation: 'Piling up success stories is confirmation bias — motivated reasoning gathering only the hits. Confirming cases can never test a belief; a real test risks refutation, so you must hunt the failures and controlled comparisons that could prove you wrong.',
      },
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-19-2',
      quote: 'A theory which is not refutable by any conceivable event is non-scientific.',
      author: 'Karl Popper',
      era: '1963',
      work: 'Conjectures and Refutations',
      philosopherId: 'karl-popper',
    },
    {
      type: 'question',
      prompt: 'Karl Popper argued a real test of a belief is one that could refute it.',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: true,
        explanation: 'Exactly. Popper\'s falsification is the antidote to confirmation bias: if no possible result would change your mind, you\'re collecting comfort, not evidence. Next lesson turns this into a working habit.',
      },
    },
    {
      type: 'summary',
      title: 'Catching Your Own Bias',
      keyPoints: [
        'Confirmation bias favors evidence that flatters our beliefs',
        'Motivated reasoning makes us our own worst judge',
        'Confirming cases can never truly test a claim',
        'A real test risks proving you wrong',
      ],
      closingThought: 'You now know the bias that builds the fallacies. Next: how to actually disarm it.',
    },
  ],
};

export default lesson;
