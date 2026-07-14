import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-27',
  slug: 'laws-of-nature',
  title: 'Do the Laws of Nature Compel?',
  description: 'The sun has risen every day. Must it rise tomorrow — or has it just always happened to?',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Gravity has never once failed. Does it have to hold?',
      subtext: 'A law of nature might force events — or merely report them.',
      emoji: '🍎',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier Hume challenged the link between cause and effect.',
      body: 'Earlier you saw Hume could find no power tying cause to effect — only one event reliably following another. That same suspicion now turns on laws of nature. Maybe a "law" is just a pattern that has held, with nothing making it hold.',
      emoji: '🔗',
    },
    {
      type: 'concept',
      title: 'Laws as Mere Regularities',
      body: 'On the Humean view, a law of nature is just a true, exceptionless regularity — the best summary of what actually happens. "Metals expand when heated" records that they always have. There is no hidden necessity behind it forcing the next case; the universe simply unfolds in patterns we compress into laws.',
      visual: '📊',
      highlight: 'mere regularity',
    },
    {
      type: 'concept',
      title: 'Laws as Real Necessities',
      body: 'The rival view, associated with Armstrong, says a regularity alone is too weak. A genuine law is a necessitation relation between properties: being heated necessitates expanding. The pattern holds because something in nature makes it hold. Strip that out and you cannot explain why the regularity is reliable rather than a long coincidence.',
      visual: '🧲',
      highlight: 'necessitation',
    },
    {
      type: 'example',
      title: 'The Two Marble Bags',
      scenario: 'In one bag, every marble happens to be blue — pure accident; the next could have been red. In another, a machine paints each marble blue as it enters, forcing the colour. Both bags show the same regularity: all blue. Yet only the second has something making it so. The Humean sees the world as the first bag; Armstrong sees it as the second.',
      emoji: '🔵',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-27-1',
      quote: 'Experience only teaches us how one event constantly follows another, without instructing us in the secret connexion which binds them together.',
      author: 'David Hume',
      era: '1748',
      work: 'An Enquiry Concerning Human Understanding',
      philosopherId: 'david-hume',
    },
    {
      type: 'question',
      prompt: 'What is the strongest objection the necessitarian raises against the "laws are just regularities" view?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Regularities exist but are invisible', isCorrect: false },
          { id: 'b', text: 'A mere regularity cannot distinguish a law from a vast coincidence, or explain why it holds', isCorrect: true },
          { id: 'c', text: 'Hume never observed any regularities', isCorrect: false },
          { id: 'd', text: 'Laws change too often to be regularities', isCorrect: false },
        ],
        explanation: 'The inference-and-explanation problem: if a law is only "it always happens," then a freak universe-long coincidence would equally count as a law, and nothing explains why the pattern keeps holding or supports predictions. Necessitation is meant to supply the missing "must" that a bare regularity leaves out.',
      },
    },
    {
      type: 'dilemma',
      scenario: 'You release a stone and it falls, as it always has. A child asks: "Does it have to fall, or does it just always happen to?"',
      prompt: 'What makes the stone fall every time?',
      choices: [
        { id: 'a', label: 'It just always does; the law is the pattern, nothing more' },
        { id: 'b', label: 'A real necessity in nature forces it to fall' },
        { id: 'c', label: 'A deep dispositional power of matter to attract' },
      ],
      views: [
        {
          thinker: 'Hume (regularity)',
          stance: 'There is only the constant pattern.',
          why: 'We see the stone fall, never a "must" behind it. A law is the best compact summary of what always happens. Expecting necessity is a habit of the mind, not a feature we ever observe in the falling.',
        },
        {
          thinker: 'Armstrong (necessitation)',
          stance: 'A law of nature forces the falling.',
          why: 'Mass necessitates gravitational attraction — a real relation between properties, not just a tally of cases. That necessitation is why the regularity holds and why our predictions are reliable rather than lucky guesses.',
        },
        {
          thinker: 'Dispositionalist',
          stance: 'Things fall because of their own powers.',
          why: 'Laws are not extra entities over objects. Massive bodies just have an intrinsic disposition to attract — a power they would exercise in the right conditions. The "law" describes those powers; it does not float above them.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'Pattern or Power?',
      keyPoints: [
        'Humean: laws are just exceptionless regularities',
        'Armstrong: laws are real necessitation between properties',
        'Regularities cannot tell law from coincidence',
        'Dispositionalists ground laws in objects’ own powers',
      ],
      closingThought: 'You now know why "the sun rises every day" and "the sun must rise" are not the same claim.',
    },
  ],
};

export default lesson;
