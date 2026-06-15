import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-29',
  slug: 'realism-vs-anti-realism',
  title: 'Does Reality Need a Mind?',
  description: 'If every mind vanished tonight, would the mountains still be there?',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'No one in the forest. Does the falling tree make a sound?',
      subtext: 'Behind the cliché hides a serious question about reality itself.',
      emoji: '🌲',
    },
    {
      type: 'concept',
      title: 'Realism: The World Without Us',
      body: 'Realism says the world exists and has its nature independently of any mind. Mountains, electrons, and the past would be exactly as they are even if no one ever perceived or thought about them. Our ideas track reality; they do not make it. The tree falling makes vibrations whether or not an ear is there.',
      visual: '🏔️',
      highlight: 'mind-independent',
    },
    {
      type: 'concept',
      title: 'Anti-Realism: Reality and Mind Entwined',
      body: 'Anti-realism says what counts as real is not fully independent of minds. In its boldest form — idealism — to exist is to be perceived or thought. Softer versions say the world has no fixed structure until our concepts carve it, so reality and our way of knowing it cannot be cleanly pulled apart.',
      visual: '🪞',
      highlight: 'mind-dependent',
    },
    {
      type: 'example',
      title: 'Berkeley’s Tree',
      scenario: 'Bishop Berkeley argued you can never picture an unseen tree, because the moment you try, you are picturing it — a perceived tree, not an unperceived one. He concluded that to be is to be perceived: things are bundles of sensations, and there is no inert, unsensed "matter" lurking behind them holding the world up.',
      emoji: '🌳',
      source: 'Berkeley, A Treatise Concerning the Principles of Human Knowledge (1710)',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-29-1',
      quote: 'Their esse is percipi, nor is it possible they should have any existence out of the minds or thinking things which perceive them.',
      author: 'George Berkeley',
      era: '1710',
      work: 'A Treatise Concerning the Principles of Human Knowledge',
      philosopherId: 'george-berkeley',
    },
    {
      type: 'question',
      prompt: 'A friend says: "Berkeley\'s idealism is silly — kick a rock and you prove matter is real." Why does this miss him?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It refutes him — the felt resistance is mind-independent matter', isCorrect: false },
          { id: 'b', text: 'The felt resistance is itself a perception, exactly what Berkeley says reality is made of', isCorrect: true },
          { id: 'c', text: 'Berkeley denied that rocks exist at all', isCorrect: false },
          { id: 'd', text: 'Kicking is not a real experiment', isCorrect: false },
        ],
        explanation: 'This is the stone-kicking trap (Dr Johnson’s famous gesture). The hardness and pain you feel are sensations — perceptions. Berkeley never denies the rock or the jolt; he denies there is inert, unperceived matter behind the sensations. Pointing at a vivid perception cannot disprove a view that says reality just is perception.',
      },
    },
    {
      type: 'dilemma',
      scenario: 'Every conscious being in the universe blinks out of existence at once. No minds remain anywhere.',
      prompt: 'Do the mountains still exist?',
      choices: [
        { id: 'a', label: 'Yes — they exist independently of any mind' },
        { id: 'b', label: 'No — to exist is to be perceived' },
        { id: 'c', label: '"Exist" has no settled meaning without a knower' },
      ],
      views: [
        {
          thinker: 'Realist',
          stance: 'The mountains remain, unperceived.',
          why: 'Reality does not lean on observers. The rock, the past, and the laws were here before any mind and would outlast every mind. Our perceiving discovers the world; it does not prop it up.',
        },
        {
          thinker: 'Berkeley (idealist)',
          stance: 'Nothing physical persists unperceived — unless God perceives it.',
          why: 'To be is to be perceived, so unsensed mountains are a contradiction. Berkeley’s rescue: God perceives all things always, so the world endures in the divine mind even when no human looks.',
        },
        {
          thinker: 'Kantian',
          stance: 'Something is there, but not the world as we know it.',
          why: 'Space, time, and objects are how minds must structure experience. Strip away all minds and a thing-in-itself may remain, but the ordered world of mountains and moments — that depends on a knower.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'Whose World Is It?',
      keyPoints: [
        'Realism: the world exists independently of minds',
        'Anti-realism: the real is tied to minds',
        'Berkeley: to be is to be perceived',
        'Kant: we know appearances, not things-in-themselves',
      ],
      closingThought: 'You now know the forest puzzle was never about sound — it was about whether reality needs a witness.',
    },
  ],
};

export default lesson;
