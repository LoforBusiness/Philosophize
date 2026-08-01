import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-15',
  slug: 'causation-humes-challenge',
  title: 'Does Cause Really Connect?',
  description: 'You see the cue ball hit the eight. But do you ever see causation itself?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You see one ball strike another. Do you ever see why?',
      subtext: 'Watch closely. Maybe the most ordinary fact in the world is also the strangest.',
      emoji: '🎱',
    },
    {
      type: 'concept',
      title: 'What You Actually Observe',
      body: 'Hume asks you to look hard. You see one ball roll up. You see the other roll off. You see this pairing happen again and again. But you never see the connection that makes the second follow — no link, no glue, no force on display.',
      visual: '👁️',
      highlight: 'constant conjunction',
    },
    {
      type: 'example',
      title: 'Slow It to a Single Frame',
      scenario: 'Freeze the collision frame by frame. Ball one touches ball two. Then ball two moves. Between those frames you find contact and then motion — never a visible "must." We expect the effect because we have seen the pair a thousand times, not because we ever glimpsed the cause forcing it.',
      source: 'David Hume, An Enquiry Concerning Human Understanding, VII',
      emoji: '🎞️',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-15-1',
      quote: 'All inferences from experience suppose, as their foundation, that the future will resemble the past.',
      author: 'David Hume',
      era: '1748',
      work: 'An Enquiry Concerning Human Understanding, IV',
      philosopherId: 'david-hume',
    },
    {
      type: 'concept',
      title: 'The Habit of the Mind',
      body: 'So where does our idea of "causal power" come from? Hume\'s answer: from us. Repeated pairings train the mind to expect the effect when it meets the cause. We then project that felt expectation onto the world and call it necessity.',
      visual: '🧠',
      highlight: 'projection',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw two kinds of necessity.',
      body: 'Earlier you separated logical necessity (a triangle must have three sides) from causal necessity. Hume drives a wedge: it is no contradiction to imagine the cue ball stopping dead. Causal necessity is felt habit, not proven logic — the same assumption quietly powering determinism.',
      emoji: '🔗',
    },
    {
      type: 'question',
      prompt: 'A friend insists the link is obvious: "We plainly observe the force that makes the effect follow." Where does Hume say they err?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'They are right — we perceive the connecting force directly', isCorrect: false },
          { id: 'b', text: 'Causes and effects do not really happen at all', isCorrect: false },
          { id: 'c', text: 'They project a felt expectation onto the world and mistake it for something observed', isCorrect: true },
          { id: 'd', text: 'Science has not yet found the link, but instruments will reveal it', isCorrect: false },
        ],
        explanation: 'Option A commits the projection error Hume diagnoses: we mistake an inner habit of expectation, built from repeated pairings, for a feature we perceive out in the world. We only ever observe succession and constant conjunction — never the connecting "glue." (B overshoots: Hume keeps the events, just not the visible necessity.)',
      },
    },
    {
      // Added when this lesson became cinematic: the scene's second graded question
      // is answered on the stage, and E37c requires the data to carry the same two
      // questions with the same correct answers.
      type: 'question',
      prompt: 'On Hume\'s account, where does the felt connection between cause and effect live?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'In the observer, as a habit of expectation', isCorrect: true },
          { id: 'b', text: 'In the gap between the two events', isCorrect: false },
          { id: 'c', text: 'In the second object, which receives the force', isCorrect: false },
          { id: 'd', text: 'Nowhere at all — Hume denies that causes exist', isCorrect: false },
        ],
        explanation: 'Constant conjunction trains an expectation, and the felt push of that expectation is what we then report as having seen. Hume keeps the events; he relocates the necessity.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'We observe succession, never the connection itself',
        'Constant conjunction trains the mind to expect',
        'Causal "power" is projected habit, not perception',
        'Causal necessity is not logical necessity',
      ],
      closingThought: 'The link you thought was in the world may live in you — and that suspicion reshaped philosophy ever after.',
    },
  ],
};

export default lesson;
