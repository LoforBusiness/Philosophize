import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'epistemology-knowledge-17',
  slug: 'paradigm-shifts',
  title: 'When Science Changes Its Mind',
  description: 'Kuhn argued knowledge does not just accumulate. Sometimes it revolts.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Sometimes science does not improve. It revolts.',
      subtext: 'Now and then the whole map gets thrown out and redrawn from scratch.',
      emoji: '🌍',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier Popper pictured science as steady refutation.',
      body: 'Thomas Kuhn looked at actual history and saw something messier. Most of the time scientists do not try to overturn their theory. They defend it, patching anomalies, until the whole framework suddenly collapses.',
      emoji: '📚',
    },
    {
      type: 'concept',
      title: 'Normal Science and Anomalies',
      body: 'In normal science, researchers work inside a shared paradigm, solving puzzles and explaining away the odd anomaly. But anomalies pile up. Eventually the paradigm cracks under their weight, and the field enters crisis.',
      visual: '⚙️',
      highlight: 'paradigm',
    },
    {
      type: 'example',
      title: 'When the Sun Stood Still',
      scenario:
        'For centuries astronomers placed Earth at the center, adding ever more circles to save the theory. The anomalies multiplied. Then Copernicus moved the Sun to the center, and the whole picture reorganized at once. That was not a tweak. It was a revolution.',
      source: 'Thomas Kuhn, The Structure of Scientific Revolutions',
      emoji: '☀️',
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-17-1',
      quote: 'The successive transition from one paradigm to another via revolution is the usual developmental pattern of mature science.',
      author: 'Thomas Kuhn',
      era: '1962',
      work: 'The Structure of Scientific Revolutions',
      philosopherId: 'thomas-kuhn',
    },
    {
      // The cinematic scene asks this one on the stage, by tapping what moved when
      // the paradigm did (E37c).
      type: 'question',
      prompt: 'Copernicus moves the Sun to the centre and the whole picture reorganises. On Kuhn\'s account, what changed?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The framework the facts were read inside', isCorrect: true },
          { id: 'b', text: 'The observations themselves', isCorrect: false },
          { id: 'c', text: 'The instruments available to astronomers', isCorrect: false },
        ],
        explanation: 'The observed positions of the planets did not move, and Copernicus had no better instruments than Ptolemy. What changed was the framework the same data was read inside — which is why Kuhn says the scientist afterwards works in a different world while the world has not changed. Option B is the reading that makes Kuhn sound like a relativist, and it is the one he takes care to avoid.',
      },
    },
    {
      type: 'question',
      prompt: 'Place a scientific revolution in Kuhn’s order, from settled work to a new framework.',
      xpValue: 5,
      interaction: {
        type: 'sort',
        items: [
          { id: 'normal', text: 'Normal science: puzzle-solving inside the accepted paradigm' },
          { id: 'crisis', text: 'Crisis: anomalies pile up and confidence cracks' },
          { id: 'shift', text: 'Paradigm shift: a new framework replaces the old' },
        ],
        correctOrder: ['normal', 'crisis', 'shift'],
        explanation:
          'Kuhn’s cycle runs from normal science, through a crisis as anomalies accumulate, to a revolutionary shift. The lesson: knowledge does not only grow by adding bricks. Sometimes the whole building is rebuilt.',
      },
    },
    {
      type: 'quote',
      id: 'lq-epistemology-knowledge-17-2',
      quote: 'Though the world does not change with a change of paradigm, the scientist afterward works in a different world.',
      author: 'Thomas Kuhn',
      era: '1962',
      work: 'The Structure of Scientific Revolutions',
      philosopherId: 'thomas-kuhn',
    },
    {
      type: 'summary',
      title: 'Revolutions in Knowledge',
      keyPoints: [
        'Normal science works inside a shared paradigm',
        'Anomalies build until the paradigm enters crisis',
        'A paradigm shift reorganizes the whole field',
        'Knowledge can revolt, not just accumulate',
      ],
      closingThought: 'After a shift, scientists almost see a different world. The facts had not changed. The framework had.',
    },
  ],
};

export default lesson;
