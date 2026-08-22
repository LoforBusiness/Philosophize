import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-16',
  slug: 'science-and-falsification',
  title: 'What Makes A Claim Scientific?',
  description: 'Popper’s answer: a real theory sticks its neck out and risks being wrong.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A theory that explains everything explains nothing.',
      subtext: 'For Popper, the mark of science is not what it confirms, but what it forbids.',
      emoji: '🧪',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you asked why we trust the future.',
      body: 'Hume showed induction can never prove a universal law — no pile of white swans guarantees the next one. Popper agreed, then flipped it: maybe science never proves theories at all. It only ever tries to disprove them.',
      emoji: '🔄',
    },
    {
      type: 'concept',
      title: 'Falsifiability',
      body: 'Popper’s test for science: a theory must forbid something. "All swans are white" risks refutation — one black swan kills it. A claim that no possible observation could ever contradict is not bold, it is empty. It is unfalsifiable.',
      visual: '🦢',
      highlight: 'falsifiability',
    },
    {
      type: 'example',
      title: 'The Bold Prediction',
      scenario:
        'In 1915 Einstein predicted gravity would bend starlight by a precise amount. He named the result that would have destroyed his theory. The 1919 eclipse measured the bending; it matched. A theory that could have shrugged off any result, bending or none, would have told us nothing.',
      source: 'Karl Popper, Conjectures and Refutations',
      emoji: '🌟',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-16-1',
      quote: 'A theory which is not refutable by any conceivable event is non-scientific.',
      author: 'Karl Popper',
      era: '1963',
      work: 'Conjectures and Refutations',
      philosopherId: 'karl-popper',
    },
    {
      // The cinematic scene asks this one on the stage, by tapping the theory whose
      // bar covers every possible result (E37c).
      type: 'question',
      prompt: 'Three theories about the 1919 eclipse. Which one could no result have refuted?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The one compatible with any amount of bending, or none', isCorrect: true },
          { id: 'b', text: 'Einstein\'s, which predicted 1.75 seconds of arc', isCorrect: false },
          { id: 'c', text: 'Newton\'s, which predicted about half that', isCorrect: false },
        ],
        explanation: 'A theory that permits every outcome forbids none, so nothing that came back could count against it — and it learned nothing from the measurement either way. The two specific predictions each staked almost everything on a single reading, which is exactly what made the eclipse worth photographing. Popper\'s test is what a theory rules out.',
      },
    },
    {
      type: 'question',
      prompt: 'Someone boasts: "My theory fits every possible outcome, so nothing could ever prove it wrong — that is its strength." For Popper, is this a strength?',
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation:
          'False. This feels like strength but is the fatal flaw. A theory consistent with every conceivable result forbids nothing and risks nothing, so no observation could test it. What cannot fail also cannot inform — it tells us nothing about how the world is.',
      },
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-16-2',
      quote: 'Every genuine test of a theory is an attempt to falsify it, or to refute it.',
      author: 'Karl Popper',
      era: '1963',
      work: 'Conjectures and Refutations',
      philosopherId: 'karl-popper',
    },
    {
      type: 'summary',
      title: 'Science Risks Being Wrong',
      keyPoints: [
        'A scientific claim must forbid something',
        'Science advances by attempted refutation, not proof',
        'Unfalsifiable theories explain nothing',
        'Bold, testable predictions are the gold standard',
      ],
      closingThought: 'The strength of a real theory is its vulnerability — it dares the world to prove it wrong.',
    },
  ],
};

export default lesson;
