import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'logic-arguments-20',
  slug: 'charity-and-steelmanning',
  title: 'Beat the Best Version, Not the Worst',
  description: 'The logician\'s discipline: argue against the strongest form of a view, not a caricature.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Anyone can beat an argument they made up themselves.',
      subtext: 'The real test is defeating the strongest version of what your opponent believes.',
      emoji: '🛡️',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you learned the straw man.',
      body: 'In Lesson 9 you spotted the straw man — beating a weaker fake of someone\'s view. And in Lesson 19, confirmation bias kept you cozy with only your own side. This lesson is the cure for both.',
      emoji: '🌾',
    },
    {
      type: 'concept',
      title: 'Steelmanning',
      body: 'Before you reply, rebuild your opponent\'s argument in its strongest, most reasonable form — repairs and all. Then attack that. If you can\'t defeat the best version, you haven\'t actually refuted the view; you\'ve only flattered yourself.',
      visual: '⚒️',
      highlight: 'strongest, most reasonable form',
    },
    {
      type: 'example',
      title: 'Rapoport\'s Rules',
      scenario: 'Daniel Dennett\'s recipe for honest criticism: first re-express your target\'s position so clearly they say "Thanks, I wish I\'d put it that way." List what you agree with, note what you learned — and only then say a word against it. That earned target is worth attacking.',
      source: 'Dennett, Intuition Pumps, 2013',
      emoji: '🧠',
    },
    {
      type: 'quote',
      id: 'lq-logic-arguments-20',
      quote: 'He who knows only his own side of the case knows little of that.',
      author: 'John Stuart Mill',
      era: '1859',
      work: 'On Liberty',
      philosopherId: 'john-stuart-mill',
    },
    {
      type: 'dilemma',
      scenario: 'You\'re debating someone whose argument has an obvious weak spot you could pounce on. But you suspect a stronger version is sitting just behind it — one they haven\'t quite said out loud yet.',
      prompt: 'What does a good logician do first?',
      choices: [
        { id: 'a', label: 'Pounce on the obvious weak point and win' },
        { id: 'b', label: 'Rebuild the strongest version, then engage that' },
        { id: 'c', label: 'Dismiss the whole view since it\'s flawed' },
      ],
      views: [
        {
          thinker: 'John Stuart Mill',
          stance: 'Engage the strongest opposing case.',
          why: 'Unless you meet the best version your opponents can offer, you don\'t truly understand even your own position — you\'ve only memorized it, never tested it.',
        },
        {
          thinker: 'Daniel Dennett',
          stance: 'State their view so well they\'d thank you.',
          why: 'Re-express the position better than they did, grant what\'s right, then critique. Criticism that skips this step is just point-scoring, not honest reasoning.',
        },
        {
          thinker: 'Karl Popper',
          stance: 'Refute the best version or nothing.',
          why: 'Knowledge survives only by passing real tests. Beating a weak form proves nothing; only refuting the strongest version teaches you whether the idea actually holds.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'question',
      prompt: 'You demolish a friend\'s clumsiest phrasing while ignoring their real point. Charitable?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'No — that\'s a straw man, beating the weak version', isCorrect: true },
          { id: 'b', text: 'Yes — they said it, so it\'s fair game', isCorrect: false },
          { id: 'c', text: 'Yes — winning the exchange is what matters', isCorrect: false },
          { id: 'd', text: 'No — but only because you were rude', isCorrect: false },
        ],
        explanation: 'Tempting, because they really did say it — but attacking their clumsiest phrasing instead of their real point is the straw man. Charity means repairing the view first, then beating its strongest form.',
      },
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Steelman: rebuild the strongest version, then attack it',
        'It\'s the disciplined opposite of the straw man',
        'Charity is the cure for confirmation bias',
        'Beat the best version, or you\'ve refuted nothing',
      ],
      closingThought: 'Now every fallacy you learned to spot becomes a tool for honesty, not a weapon. Path complete.',
    },
  ],
};

export default lesson;
