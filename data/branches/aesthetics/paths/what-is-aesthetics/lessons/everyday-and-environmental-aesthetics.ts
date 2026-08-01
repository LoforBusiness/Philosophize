import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-19',
  slug: 'everyday-and-environmental-aesthetics',
  title: 'The Beauty You Walk Past',
  description: "Aesthetics isn't only for museums — a marsh, a meal, or a commute can qualify.",
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'No frame, no gallery, no label. Is it still aesthetic?',
      subtext: 'A muddy wetland can reward attention as richly as any painting.',
      emoji: '🪶',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you trained the eye and met the sublime.',
      body: "Earlier you saw aesthetics as a way of seeing; you found awe in storms and mountains. Now we widen the field: appreciation reaches past art objects into nature and ordinary life.",
      emoji: '🌾',
    },
    {
      type: 'concept',
      title: 'Aesthetics Off the Wall',
      body: 'Everyday and environmental aesthetics extend appreciation beyond artworks — to a marsh, a meal, a commute. Allen Carlson argues that appreciating nature well demands knowledge, ecology and natural history, the way understanding a painting demands art history.',
      visual: '🌍',
      highlight: 'scientific cognitivism',
    },
    {
      type: 'example',
      title: 'Two Ways to See a Wetland',
      scenario: 'A passerby calls a marsh ugly: flat, buggy, no view. An ecologist sees a thriving nursery — filtering water, sheltering rare birds, cycling life. Carlson says the second appreciates it correctly, for what it actually is, while the first judges it as failed scenery.',
      source: 'Allen Carlson, Aesthetics and the Environment (2000)',
      emoji: '🦆',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-19-1',
      quote: 'We must appreciate nature for what it is and as having the qualities that it has; natural history plays the role art history plays for art.',
      author: 'Allen Carlson',
      era: '2000',
      work: 'Aesthetics and the Environment',
    },
    {
      type: 'question',
      prompt: "On Carlson's view, appreciating a wetland well needs no knowledge — a pretty glance is enough, since nature is just scenery. True or false?",
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: "False. This is the 'scenery' picture Carlson rejects — an aesthetic appeal to ignorance, where not knowing counts as not needing to know. He argues ecological knowledge guides correct appreciation, just as art history guides our reading of a painting.",
      },
    },
    {
      type: 'reinforcement',
      callout: 'Recall the question of what counts as art.',
      body: 'That definitional work asked where the aesthetic begins and ends. Carlson pushes the boundary outward: if knowledge can correct how we appreciate art, it can correct how we appreciate a forest, a fog, or a field too.',
      emoji: '🧭',
    },
    {
      // Added when this lesson became cinematic: the scene's second graded question
      // is answered on the stage, and E37c requires the data to carry the same two
      // questions with the same correct answers.
      type: 'question',
      prompt: 'The frame never moved and neither did the marsh. What changed the verdict?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Knowing what it actually is', isCorrect: true },
          { id: 'b', text: 'Finding a better vantage point', isCorrect: false },
          { id: 'c', text: 'Framing it, which makes anything art', isCorrect: false },
          { id: 'd', text: 'Nothing real — the second reading is sentimental', isCorrect: false },
        ],
        explanation: 'A frame decides where you point; it cannot tell you what you are looking at. On Carlson\'s view natural history is the part appreciation was waiting on, exactly as art history is for a painting.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Aesthetics reaches beyond art into nature and daily life',
        'Carlson: knowing nature shapes appreciating it',
        'The pretty-glance view treats nature as mere scenery',
      ],
      closingThought: 'The marsh was never plain — you simply had not learned to read it.',
    },
  ],
};

export default lesson;
