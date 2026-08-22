import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-17',
  slug: 'hard-problem-consciousness-qualia',
  title: 'Why Does Experience Feel Like Anything?',
  description: 'Science can map every neuron firing. Can it explain the redness of red?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Why is there something it is like to be you?',
      subtext: 'A perfect brain scan still seems to miss the feeling.',
      emoji: '🔴',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw the mind-body knot.',
      body: 'Earlier lessons left physicalists confident the mind is just what the brain does. But even if every thought is brain activity, one stubborn thing seems left out: why any of it is felt at all.',
      emoji: '🧠',
    },
    {
      type: 'concept',
      title: 'The Easy and the Hard Problem',
      body: 'Chalmers split the question in two. The "easy" problems — how the brain detects light, stores memory, controls behavior — are hard but ordinary science. The hard problem is different: why is all that processing accompanied by any inner experience at all?',
      visual: '🌓',
      highlight: 'the hard problem',
    },
    {
      type: 'concept',
      title: 'Qualia',
      body: 'Qualia are the raw felt qualities of experience — the redness of red, the sting of pain, the taste of coffee. You can describe wavelengths and neurons fully, yet that description never seems to add up to what red actually looks like from the inside.',
      visual: '🎨',
      highlight: 'qualia',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-17-1',
      quote: "Why doesn't all this information-processing go on 'in the dark', free of any inner feel?",
      author: 'David Chalmers',
      era: '1995',
      work: 'Facing Up to the Problem of Consciousness',
      philosopherId: 'david-chalmers',
    },
    {
      type: 'example',
      title: "Mary the Color Scientist",
      scenario: "Frank Jackson imagined Mary, a brilliant scientist who knows every physical fact about color vision but has lived her whole life in a black-and-white room. One day she steps outside and sees a red rose for the first time. Does she learn anything new — what red actually looks like?",
      emoji: '🌹',
      source: 'Jackson, "Epiphenomenal Qualia" (1982)',
    },
    {
      // The cinematic scene asks this one on the stage, by tapping what Mary gains
      // when she steps outside (E37c).
      type: 'question',
      prompt: 'Mary knows every physical fact about colour and then sees red for the first time. What does she gain?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'What red is like from the inside', isCorrect: true },
          { id: 'b', text: 'One more physical fact she had not reached yet', isCorrect: false },
          { id: 'c', text: 'Nothing — she only feels as though she learns', isCorrect: false },
        ],
        explanation: 'Options B and C are the two serious physicalist replies, which is why they are here rather than as filler. B has to say the wall of physical facts was never actually complete, which is awkward when it was complete by stipulation. C has to tell Mary she is mistaken about her own first look at a rose. The knowledge argument says she gains a quale, and that qualia are what physical description keeps leaving out.',
      },
    },
    {
      type: 'question',
      prompt: "Mary knows every physical fact about color, but has only seen black and white. She learns nothing new the first time she sees red. True?",
      xpValue: 5,
      interaction: {
        type: 'true-false',
        answer: false,
        explanation: 'False, per the knowledge argument. It is tempting to think complete physical knowledge means complete knowledge — but that conflates knowing every physical fact with knowing what an experience is like. Mary plainly learns something new (what red looks like), so qualia seem to escape physical description. This is the explanatory gap.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Easy problems explain function; the hard problem explains feeling',
        'Qualia are the inner felt quality of experience',
        "Mary's Room: physical facts seem to miss what red is like",
        'The explanatory gap haunts even physicalism',
      ],
      closingThought: 'Map every neuron and the question lingers: why is any of it lit from within, rather than going on in the dark?',
    },
  ],
};

export default lesson;
