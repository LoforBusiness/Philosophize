import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-27',
  slug: 'the-avant-garde',
  title: 'Why Art Keeps Breaking Its Own Rules',
  description: 'A blank canvas. Four minutes of silence. Why does art seem driven to shock?',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Once, a melody. Then a noise. Then four minutes of silence.',
      subtext: 'Every generation of art seems determined to break the rules the last one wrote.',
      emoji: '💥',
    },
    {
      type: 'concept',
      title: 'The Avant-Garde',
      body: 'Avant-garde is a military term — the "advance guard" that goes first into unknown territory. In art it names work that deliberately breaks convention to push into the new: Cubism shattering perspective, atonal music abandoning the key, poetry abandoning the sentence. Its mission is to make the familiar strange again.',
      visual: '🚩',
      highlight: 'avant-garde',
    },
    {
      type: 'example',
      title: '4 Minutes of Silence',
      scenario: 'In 1952 a pianist sat at a piano and played nothing for four minutes and thirty-three seconds. John Cage\'s 4′33″ has no notes; the "music" is the coughs, shuffles, and traffic the audience hears in the silence. Outrageous — yet it forced a real question: where does music stop and mere sound begin?',
      source: 'John Cage, 4′33″ (1952)',
      emoji: '🤫',
    },
    {
      type: 'concept',
      title: 'Why Break the Rules?',
      body: 'Not mere attention-seeking. The avant-garde gambit is that habit dulls perception — we stop truly seeing what we\'ve seen a thousand times. By breaking form, art "defamiliarises" the world, jolting us back into actually noticing. Each rule, once broken and absorbed, becomes the next convention to break.',
      visual: '🔨',
      highlight: 'defamiliarisation',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-27-1',
      quote: 'Art exists that one may recover the sensation of life... to make the stone stony.',
      author: 'Viktor Shklovsky',
      era: '1917',
      work: 'Art as Technique',
    },
    {
      type: 'question',
      prompt: 'What is the avant-garde breaking the rules for?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'To wake a habituated audience up', isCorrect: true },
          { id: 'b', text: 'To shock, and nothing beyond that', isCorrect: false },
          { id: 'c', text: 'To sell the work for more', isCorrect: false },
          { id: 'd', text: 'To prove the old rules were mistakes', isCorrect: false },
        ],
        explanation: 'Defamiliarisation. Shklovsky said art exists to make the stone stony: a broken form makes a familiar thing visible again. Shock is the method rather than the aim, the market grew round the work afterwards, and nothing here says perspective or the key was a mistake.',
      },
    },
    {
      type: 'question',
      prompt: 'A gallery tapes a banana to the wall and crowds gather. What has happened to the shock the avant-garde traded in?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Once shocking, now just another convention', isCorrect: true },
          { id: 'b', text: 'Still as startling as it was in 1917', isCorrect: false },
          { id: 'c', text: 'Each generation is harder to startle than the last', isCorrect: false },
          { id: 'd', text: 'One scandal, and then nothing at all', isCorrect: false },
        ],
        explanation: 'It decays. Every broken rule is absorbed and becomes the convention the next generation breaks, which is why the movement has to keep moving. Peter Burger made the point about the gallery: once shock sells, the rebellion has been housed.',
      },
    },
    {
      type: 'reinforcement',
      callout: 'Yesterday\'s scandal is today\'s textbook.',
      body: 'Impressionism was once mocked as unfinished smears; now it sells the most postcards. The avant-garde\'s fate is to be absorbed: what shocks one generation becomes the next generation\'s comfortable taste — which is precisely why art must keep moving.',
      emoji: '🌊',
    },
    {
      type: 'summary',
      title: 'The Advance Guard',
      keyPoints: [
        'Avant-garde: art that deliberately breaks convention',
        'Goal: defamiliarise — make us truly see again',
        'Cage\'s 4′33″ asked where music\'s edge lies',
        'Each broken rule becomes the next to break',
      ],
      closingThought: 'Art breaks its rules so that we, half-asleep, might wake up and look.',
    },
  ],
};

export default lesson;
