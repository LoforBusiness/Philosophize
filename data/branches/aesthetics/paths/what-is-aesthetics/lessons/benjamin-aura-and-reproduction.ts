import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-24',
  slug: 'benjamin-aura-and-reproduction',
  title: 'Does a Copy Kill the Magic?',
  description: 'A million prints of the Mona Lisa exist. Why do crowds still queue for the original?',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You\'ve seen the Mona Lisa a thousand times. You\'ve never seen it.',
      subtext: 'Prints, mugs, phone screens — and still people cross oceans to stand before the panel.',
      emoji: '🖼️',
    },
    {
      type: 'concept',
      title: 'The Aura',
      body: 'Walter Benjamin called it the aura: an artwork\'s unique presence in one place and time. The original hangs here, now, carrying its whole history — the hand that made it, the centuries it survived. Standing before it, you feel a distance, an authority no reproduction holds. The aura is bound to the singular original.',
      visual: '✨',
      highlight: 'aura',
    },
    {
      type: 'example',
      title: 'Cathedral to Cinema',
      scenario: 'A medieval altarpiece sat in one church, seen by pilgrims who travelled to it — distant, sacred, unique. A film is the opposite: shot in fragments, copied onto countless reels, screened the same night in a hundred cities at once. There is no "original" print to make a pilgrimage to. The aura has nowhere to live.',
      source: 'After Benjamin, "The Work of Art in the Age of Mechanical Reproduction" (1935)',
      emoji: '🎞️',
    },
    {
      type: 'concept',
      title: 'Withering — and Liberation',
      body: 'Mechanical reproduction, Benjamin argued, makes the aura wither. But he didn\'t simply mourn it. Detached from ritual and uniqueness, art becomes reproducible, shareable, political — available to the masses, not the few. Photography and film could awaken, not just decorate. Loss and liberation in one stroke.',
      visual: '📷',
      highlight: 'reproduction',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-24-1',
      quote: 'That which withers in the age of mechanical reproduction is the aura of the work of art.',
      author: 'Walter Benjamin',
      era: '1935',
      work: 'The Work of Art in the Age of Mechanical Reproduction',
    },
    {
      type: 'dilemma',
      scenario: 'A perfect digital scan of a painting fills your wall in 8K — every crack and brushstroke visible, arguably easier to study than the dim, crowded gallery original. A friend says you\'ve now "really seen" the work and the trip abroad is pointless. Another insists the copy gives you nothing essential.',
      prompt: 'Has the perfect reproduction given you the artwork?',
      choices: [
        { id: 'yes', label: 'Yes — every visible feature is there to study' },
        { id: 'no', label: 'No — presence, history, and uniqueness can\'t be copied' },
        { id: 'gain', label: 'Something is lost, but access for everyone is gained' },
      ],
      views: [
        { thinker: 'Walter Benjamin', stance: 'The copy lacks the aura', why: 'However perfect, the reproduction misses the original\'s "here and now" — its presence in time, its history of having existed. Yet this very loss frees art from ritual and opens it to the masses.' },
        { thinker: 'Nelson Goodman', stance: 'For paintings, the original still matters', why: 'Painting is "autographic": even an exact copy is a forgery, not the work. Knowing it is a copy changes how we look. So no scan, however perfect, simply is the painting.' },
        { thinker: 'A democratic optimist', stance: 'Access outweighs aura', why: 'Millions who could never reach the Louvre now study the work in detail. If art is for awakening minds, the reproduction spreads its real value far wider than the relic ever could.' },
      ],
      xpValue: 5,
    },
    {
      type: 'reinforcement',
      callout: 'Earlier: forgery and authenticity.',
      body: 'You saw that a perfect fake can be visually identical yet worth less. Benjamin explains why we care: the original carries an aura — a history of presence — that no copy inherits. Authenticity isn\'t in the pixels; it\'s in the object\'s singular existence in time.',
      emoji: '🔗',
    },
    {
      type: 'summary',
      title: 'The Aura and Its Loss',
      keyPoints: [
        'Aura: an artwork\'s unique presence in one time and place',
        'Mechanical reproduction makes the aura wither',
        'Film and photo have no original to revere',
        'Benjamin saw both a loss and a liberation',
      ],
      closingThought: 'The crowd queues for the Mona Lisa to stand where reproduction cannot follow.',
    },
  ],
};

export default lesson;
