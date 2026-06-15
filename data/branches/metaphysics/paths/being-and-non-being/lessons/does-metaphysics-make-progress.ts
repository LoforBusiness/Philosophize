import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-30',
  slug: 'does-metaphysics-make-progress',
  title: 'Does Metaphysics Get Anywhere?',
  description: 'You have crossed thirty lessons of deep questions. Have we actually made progress?',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Same questions for 2,500 years. Have we answered any?',
      subtext: 'Time to put the whole branch on trial.',
      emoji: '⚖️',
    },
    {
      type: 'reinforcement',
      callout: 'Look back at the road you have travelled.',
      body: 'You met being and nothing, time and persistence, free will and the self, causation, universals, possible worlds, mind, and the limits of the real. The debates are old and still alive. So a fair challenge arises: is this depth — or just spinning in place?',
      emoji: '🛤️',
    },
    {
      type: 'concept',
      title: 'The Charge: No Progress, No Method',
      body: 'Critics note that science settles questions and moves on, while metaphysicians still argue over claims raised in antiquity. With no experiment to decide them, the skeptic says these disputes are unanswerable — perhaps even empty, mistaking the deep grammar of our language for deep facts about the world.',
      visual: '🚫',
      highlight: 'no decisive method',
    },
    {
      type: 'concept',
      title: 'The Defence: Progress Looks Different Here',
      body: 'Defenders reply that progress need not mean closed cases. Metaphysics sharpens questions, exposes hidden assumptions, maps which positions are coherent, and rules options out. We now state the problems far more precisely than Parmenides could — and clearing away confusion is itself a kind of advance.',
      visual: '🧭',
      highlight: 'progress as clarification',
    },
    {
      type: 'example',
      title: 'The Cartographer’s Reply',
      scenario: 'Imagine mapping a vast cavern in the dark. You may never reach a final wall, yet each expedition charts new passages, marks dead ends, and corrects old maps. Travellers after you start from your map, not from scratch. Metaphysics, its defenders say, works like this: not arriving, but steadily improving the map of what could be true.',
      emoji: '🗺️',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-30-1',
      quote: 'Philosophy is to be studied, not for the sake of any definite answers, but rather for the sake of the questions themselves.',
      author: 'Bertrand Russell',
      era: '1912',
      work: 'The Problems of Philosophy',
      philosopherId: 'bertrand-russell',
    },
    {
      type: 'question',
      prompt: 'A friend says: "Metaphysics is worthless — it never reaches the certainty science does." Why is this argument flawed?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It is correct — only experiment yields real knowledge', isCorrect: false },
          { id: 'b', text: 'It assumes the demand "be like science" is itself a settled truth, which is a metaphysical claim', isCorrect: true },
          { id: 'c', text: 'Science actually has reached complete certainty', isCorrect: false },
          { id: 'd', text: 'Metaphysics has in fact closed all its questions', isCorrect: false },
        ],
        explanation: 'This is the self-undermining trap. The claim "only what science can test is meaningful" cannot itself be tested by science — it is a philosophical, even metaphysical, stance. So the verdict against metaphysics quietly relies on metaphysics, and cannot consistently dismiss the whole field.',
      },
    },
    {
      type: 'dilemma',
      scenario: 'A bright friend, after these lessons, asks the blunt question: should anyone keep doing metaphysics at all, or hand every real question over to physics?',
      prompt: 'What is metaphysics good for?',
      choices: [
        { id: 'a', label: 'Nothing — physics will answer everything worth asking' },
        { id: 'b', label: 'Clarifying concepts science must assume but cannot prove' },
        { id: 'c', label: 'Reaching truths beyond all possible experience' },
      ],
      views: [
        {
          thinker: 'Scientism',
          stance: 'Leave it to physics.',
          why: 'Only empirical methods deliver knowledge. Questions science cannot test are either disguised scientific questions or pseudo-questions. As physics advances, the space left for armchair metaphysics shrinks toward nothing.',
        },
        {
          thinker: 'Conceptual metaphysician',
          stance: 'It clarifies what science takes for granted.',
          why: 'Physics assumes notions of time, cause, law, object, and possibility — but does not justify them. Metaphysics examines those very foundations. Even reading an experiment requires ideas no experiment can supply.',
        },
        {
          thinker: 'Speculative metaphysician',
          stance: 'It reaches where experience cannot.',
          why: 'Why is there anything? What is consciousness? Whether free will is real? These lie beyond any instrument, yet they are not meaningless. Reason can map the live options even where observation can never go.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'The Verdict on Verdicts',
      keyPoints: [
        'Critics: no method, no settled answers, maybe no facts',
        'Defenders: progress is clarifying, not closing',
        '"Only science counts" is itself unprovable by science',
        'Metaphysics examines what other fields assume',
      ],
      closingThought: 'You set out asking why anything exists. The real prize was learning to ask the question well.',
    },
  ],
};

export default lesson;
