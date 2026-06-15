import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-22',
  slug: 'the-paradox-of-fiction',
  title: 'Crying Over People Who Never Existed',
  description: 'You know Anna Karenina is invented. So why do real tears fall for her?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You weep for a woman you know was never real.',
      subtext: 'No one ever lived as Anna Karenina. Yet your grief at her death is genuine.',
      emoji: '😢',
    },
    {
      type: 'concept',
      title: 'The Paradox in Three Lines',
      body: 'Three claims each seem true, yet they cannot all be. (1) We feel real emotions for fictional characters. (2) Emotions require believing their object exists. (3) We know fictions don\'t exist. Hold all three and you contradict yourself. This is the paradox of fiction.',
      visual: '🔺',
      highlight: 'paradox of fiction',
    },
    {
      type: 'example',
      title: 'The Green-Slime Test',
      scenario: 'Kendall Walton imagines Charles watching a horror film as green slime oozes toward the camera. His heart races, his muscles tense. Yet Charles does not flee the cinema or call the police. If he truly believed in the slime, he would. So is his fear real fear at all — or something else wearing its costume?',
      source: 'Kendall Walton, "Fearing Fictions" (1978)',
      emoji: '🟢',
    },
    {
      type: 'concept',
      title: 'Make-Believe, Not Belief',
      body: 'Walton\'s answer: Charles feels "quasi-fear." He is not really afraid; he plays a game of make-believe in which it is fictional that he fears the slime. Real fear sends you running. Charles stays seated and eats popcorn — proof, says Walton, that his state is not the genuine article.',
      visual: '🎬',
      highlight: 'quasi-emotions',
    },
    {
      type: 'dilemma',
      scenario: 'A character you love is killed in the final chapter. You cry, your chest tightens, you put the book down shaken. A friend insists, "You can\'t really be sad — you knew she wasn\'t real." How should we describe what just happened to you?',
      prompt: 'What did you actually feel for the character?',
      choices: [
        { id: 'real', label: 'Real grief, aimed at a merely imagined person' },
        { id: 'quasi', label: 'Quasi-emotion: make-believe sadness inside a game' },
        { id: 'thought', label: 'A real emotion stirred by vividly entertaining the thought' },
      ],
      views: [
        { thinker: 'Kendall Walton', stance: 'Quasi-emotions, not the real thing', why: 'Genuine emotions move us to act. You do not phone for help or attend a funeral. So it is fictional, within a game of make-believe, that you grieve — a quasi-emotion.' },
        { thinker: 'Thought theorists (Carroll, Lamarque)', stance: 'Real emotion, from entertaining a thought', why: 'You need not believe a thing exists to feel about it. Vividly imagining her death is enough to produce genuine, if action-less, sadness. The feeling is real; only its cause is imagined.' },
        { thinker: 'Illusion theorists', stance: 'We briefly half-believe the fiction', why: 'Absorbed in the story, we suspend disbelief and momentarily take the character as real. The emotion is ordinary; our awareness of the fiction simply lapses while we are gripped.' },
      ],
      xpValue: 5,
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-22-1',
      quote: 'Charles is not really afraid... It is fictional that he is afraid. He is engaged in a game of make-believe.',
      author: 'Kendall Walton',
      era: '1978',
      work: 'Fearing Fictions',
    },
    {
      type: 'summary',
      title: 'Tears for No One',
      keyPoints: [
        'Three plausible claims about fiction can\'t all be true',
        'Walton: we feel quasi-emotions inside make-believe',
        'Thought theory: imagining vividly is enough for real feeling',
        'Our action — or inaction — is the clue',
      ],
      closingThought: 'Maybe fiction\'s gift is exactly this: real feeling, at no real risk.',
    },
  ],
};

export default lesson;
