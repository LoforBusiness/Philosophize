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
      type: 'dilemma',
      scenario: 'A gallery exhibits a single banana duct-taped to the wall. Crowds gawk; one critic calls it a brilliant comment on the art market, another calls it an empty stunt that proves the avant-garde has run out of ideas and is now just provoking for headlines.',
      prompt: 'Is rule-breaking like this real art, or exhausted gimmickry?',
      choices: [
        { id: 'vital', label: 'Vital — it still makes us question what art is' },
        { id: 'empty', label: 'Empty — shock for its own sake, nothing more' },
        { id: 'absorbed', label: 'Once shocking, now just another convention' },
      ],
      views: [
        { thinker: 'Avant-garde defender', stance: 'Provocation reopens the question', why: 'If it makes thousands argue about where art\'s boundary lies, it has done art\'s work: jolting habit, forcing us to ask what we value and why. Discomfort is the point, not a flaw.' },
        { thinker: 'Peter Bürger', stance: 'The avant-garde gesture has been neutralised', why: 'Once the gallery and market absorb shock as a sellable style, the rebellion is tamed. Repeating Duchamp\'s gesture decades later can\'t reattack institutions that now happily profit from it.' },
        { thinker: 'A traditionalist', stance: 'Skill and beauty still matter', why: 'Endless rule-breaking mistakes novelty for value. A banana on a wall trades craft for a headline. Eventually art must offer more than the thrill of "you didn\'t expect that."' },
      ],
      xpValue: 5,
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
