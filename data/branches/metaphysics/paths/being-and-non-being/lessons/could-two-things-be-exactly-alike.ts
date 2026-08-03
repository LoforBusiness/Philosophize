import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-32',
  slug: 'could-two-things-be-exactly-alike',
  title: 'Could Two Things Be Exactly Alike?',
  description: 'Leibniz said no. Then someone imagined a universe containing two spheres and nothing else.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Two spheres. Nothing else exists anywhere.',
      subtext: 'How many things are there?',
      emoji: '⚪',
    },
    {
      type: 'concept',
      title: 'The Identity of Indiscernibles',
      body: 'Leibniz held that if two things share absolutely every property, they are not two things at all — they are one thing counted twice. It sounds close to obvious, and it does a great deal of work in his system.',
      visual: '⚖️',
      highlight: 'No difference means no two',
    },
    {
      type: 'example',
      title: 'Max Black\'s Universe',
      scenario: 'In 1952 Max Black asked us to imagine a universe with nothing in it but two iron spheres, exactly alike, two miles apart. Same size, same metal, same age. Even the relations match: each is two miles from a sphere just like itself.',
      source: 'Max Black, "The Identity of Indiscernibles"',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-32',
      quote: 'There are never two beings in nature that are perfectly alike.',
      author: 'Gottfried Wilhelm Leibniz',
      era: '1714',
    },
    {
      type: 'question',
      prompt: 'In that universe, how many things are there?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Two', isCorrect: true },
          { id: 'b', text: 'One, since nothing distinguishes them', isCorrect: false },
          { id: 'c', text: 'There is no fact of the matter', isCorrect: false },
          { id: 'd', text: 'The question is meaningless without an observer', isCorrect: false },
        ],
        explanation: 'Everything true of one is true of the other, so Leibniz\'s principle says they are the same thing — and they are plainly not. That is the force of the example: it makes a principle that felt obvious cost more than it is worth.',
      },
    },
    {
      type: 'question',
      prompt: 'So what could still tell the two spheres apart?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Where each one is — if space is a thing in its own right', isCorrect: true },
          { id: 'b', text: 'Nothing: sharing all properties, they are one sphere described twice', isCorrect: false },
          { id: 'c', text: 'Their histories — one was made before the other', isCorrect: false },
          { id: 'd', text: 'A difference too bare to detect, which must exist anyway', isCorrect: false },
        ],
        explanation: 'C is ruled out by the setup. D is the interesting failure — a bare "thisness" answers the question by restating it. A is the live reply: if space is real rather than a pattern of relations, two positions are two facts.',
      },
    },
    {
      type: 'summary',
      title: 'Two, and No Way to Say Which',
      keyPoints: [
        'Leibniz: no two things share every property',
        'Black\'s two spheres seem to do exactly that',
        'Counting them as one is worse than giving up the principle',
        'Which way you go depends on whether space is real',
      ],
      closingThought: 'A thought experiment does not prove anything. It shows you what a principle costs, and lets you decide whether to pay.',
    },
  ],
};

export default lesson;
