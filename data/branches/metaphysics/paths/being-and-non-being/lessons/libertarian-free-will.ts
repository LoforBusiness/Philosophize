import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-22',
  slug: 'libertarian-free-will',
  title: 'Could You Have Done Otherwise?',
  description: 'Compatibilism made peace with causes. Libertarians refuse the truce.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Rewind the universe to this instant. Must you choose the same?',
      subtext: 'Your answer decides what kind of freedom you believe in.',
      emoji: '⏪',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw freedom survive a caused world.',
      body: 'Lessons 8 and 16 offered compatibilism: free means unforced, not uncaused, even if every choice is determined. The libertarian rejects that bargain. For them, real freedom needs the past to leave the future genuinely open.',
      emoji: '🔓',
    },
    {
      type: 'concept',
      title: 'The Power to Do Otherwise',
      body: 'Libertarian free will is not a politics — it is the claim that we are free and determinism is false. To be truly responsible, the libertarian says, you must have been able to do otherwise, with the very same past behind you. The future must be open, not fixed.',
      visual: '🌿',
      highlight: 'able to do otherwise',
    },
    {
      type: 'concept',
      title: 'Agent Causation',
      body: 'But if your choice is not determined, is it just random? Some libertarians answer with agent causation: the choice is caused not by prior events but by you — the agent — as an originating source. You start a new causal chain rather than passing one along.',
      visual: '🫵',
      highlight: 'agent causation',
    },
    {
      type: 'example',
      title: 'The Buridan Moment',
      scenario: 'You stand at a fork with two equally good paths. Nothing in your history tips the scales. You step left. The determinist says hidden causes decided it. The compatibilist says you acted unforced, so you were free. The libertarian insists something stronger: with the entire past unchanged, you genuinely could have stepped right — and it was you, not your atoms, who settled it.',
      emoji: '🍴',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-22-1',
      quote: 'Man is condemned to be free; because once thrown into the world, he is responsible for everything he does.',
      author: 'Jean-Paul Sartre',
      era: '1946',
      work: 'Existentialism Is a Humanism',
    },
    {
      type: 'question',
      prompt: 'The hardest objection to libertarian free will is the "luck" or "randomness" problem. What does it charge?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'That uncaused choices would be arbitrary, not controlled — so not free either', isCorrect: true },
          { id: 'b', text: 'That free will violates the law of gravity', isCorrect: false },
          { id: 'c', text: 'That nobody actually feels free', isCorrect: false },
          { id: 'd', text: 'That determinism has been proven by physics', isCorrect: false },
        ],
        explanation: 'The luck objection: if your choice was not determined by anything — not even your character — then in the rewound universe it could flip for no reason. But a choice that just flips randomly looks like a dice roll, not an exercise of control. The libertarian must show how undetermined still means up-to-you.',
      },
    },
    {
      type: 'dilemma',
      scenario: 'A neuroscientist claims she can, in principle, predict every decision you will make from your brain state and surroundings. Suppose she is right.',
      prompt: 'Would perfect prediction destroy your freedom?',
      choices: [
        { id: 'a', label: 'Yes — if predictable, you could not have done otherwise' },
        { id: 'b', label: 'No — you still act unforced, and that is freedom' },
        { id: 'c', label: 'No prediction is possible; you originate your choices' },
      ],
      views: [
        {
          thinker: 'Libertarian',
          stance: 'Perfect prediction would mean we are not truly free.',
          why: 'If your choice can be read off the prior state, the future was fixed and you could not have done otherwise. Real freedom requires that the past leave more than one path genuinely open to you as the source.',
        },
        {
          thinker: 'Compatibilist',
          stance: 'Predictability does not remove freedom.',
          why: 'Freedom is acting from your own desires without external compulsion. A predictable choice can still be yours — flowing from your character. Whether it was determined is beside the point of responsibility.',
        },
        {
          thinker: 'Hard determinist',
          stance: 'We were never free; prediction just shows it.',
          why: 'Every choice is the product of prior causes you did not author. Prediction simply makes vivid what was always true. The feeling of an open future is a useful illusion, not a power.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'Freedom That Needs Open Doors',
      keyPoints: [
        'Libertarians: real freedom needs an open future',
        'You must be able to do otherwise',
        'Agent causation: you originate, not just relay',
        'The luck problem: undetermined risks mere randomness',
      ],
      closingThought: 'You now know the deepest dispute: is freedom acting from your causes, or escaping them?',
    },
  ],
};

export default lesson;
