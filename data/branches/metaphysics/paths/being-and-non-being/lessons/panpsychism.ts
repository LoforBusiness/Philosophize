import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-28',
  slug: 'panpsychism',
  title: 'Is Mind Everywhere?',
  description: 'What if consciousness was never built — only ever combined?',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Where did your mind come from — dead matter?',
      subtext: 'Some thinkers answer: mind was there all along, in everything.',
      emoji: '✨',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you met the hard problem of consciousness.',
      body: 'You have seen why felt experience resists physical explanation: you can map every neuron and still not capture what red looks like. Panpsychism is one radical response — if mind cannot be built from mindless parts, maybe the parts were never wholly mindless.',
      emoji: '🧠',
    },
    {
      type: 'concept',
      title: 'Mind as Fundamental',
      body: 'Panpsychism holds that consciousness is a basic feature of reality, like mass or charge — present, in some faint form, at the bottom of nature. Not that rocks ponder or electrons dream, but that the simplest bits of matter carry the tiniest spark of experience, which complex brains gather into rich minds.',
      visual: '🌌',
      highlight: 'consciousness is fundamental',
    },
    {
      type: 'concept',
      title: 'Why Anyone Takes It Seriously',
      body: 'It is not mysticism but a wager about the hard problem. Physics describes what matter does, never what it is in itself or what it is like to be it. If experience cannot emerge from utterly experience-free stuff, then putting a trace of experience at the base avoids the magic of mind springing from nothing.',
      visual: '⚛️',
      highlight: 'avoids mind from nothing',
    },
    {
      type: 'example',
      title: 'The Dimmer Switch',
      scenario: 'Picture experience on a dimmer, not an on-off switch. A human brain blazes; a mouse glows dimmer; an insect dimmer still; a single particle barely flickers — but never quite goes dark. On this picture, evolution did not switch consciousness on from nothing. It only turned the dimmer up, combining countless faint flickers into a vivid inner life.',
      emoji: '🔆',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-28-1',
      quote: 'The monads have no windows through which anything could come in or go out.',
      author: 'Gottfried Leibniz',
      era: '1714',
      work: 'The Monadology',
      philosopherId: 'gottfried-leibniz',
    },
    {
      type: 'question',
      prompt: 'The most serious problem for panpsychism is the "combination problem." What does it ask?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Why matter exists at all', isCorrect: false },
          { id: 'b', text: 'How tiny separate experiences combine into one unified mind like yours', isCorrect: true },
          { id: 'c', text: 'Whether electrons can be measured', isCorrect: false },
          { id: 'd', text: 'How the brain stores memories', isCorrect: false },
        ],
        explanation: 'Even granting each particle a flicker of experience, why should billions of separate micro-experiences fuse into a single, unified point of view rather than staying a crowd of tiny disconnected minds? Panpsychism trades the hard problem of getting mind from no-mind for the combination problem of getting one mind from many.',
      },
    },
    {
      type: 'question',
      prompt: 'On the panpsychist picture, what happens to experience as matter gets more organised?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It brightens from a flicker that was never quite dark', isCorrect: true },
          { id: 'b', text: 'It switches on once a brain is complex enough', isCorrect: false },
          { id: 'c', text: 'It stays the same faint glow all the way up', isCorrect: false },
          { id: 'd', text: 'There is no inner glow anywhere to explain', isCorrect: false },
        ],
        explanation: 'A dimmer, not a switch. Panpsychism puts a trace of experience at the base, so organisation only turns it up. A switch is emergentism, a flat line would leave a mouse and a person equally awake, and nothing at all is illusionism.',
      },
    },
    {
      type: 'summary',
      title: 'A Spark in Everything?',
      keyPoints: [
        'Panpsychism: consciousness is fundamental, present everywhere',
        'Motivated by the hard problem, not mysticism',
        'Brains combine faint experiences into rich minds',
        'Its great hurdle: the combination problem',
      ],
      closingThought: 'You now know that "mind from no-mind" and "mind everywhere" are both strange — and one of them may be true.',
    },
  ],
};

export default lesson;
