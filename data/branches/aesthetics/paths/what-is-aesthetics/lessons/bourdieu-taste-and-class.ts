import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'aesthetics-aesthetics-25',
  slug: 'bourdieu-taste-and-class',
  title: 'Is Your Taste Really Yours?',
  description: 'You think you just "like" opera or hip-hop. A sociologist sees your upbringing talking.',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Tell me what you find beautiful. I\'ll tell you where you\'re from.',
      subtext: 'Your taste feels like the most personal thing about you. What if it\'s the most social?',
      emoji: '🎩',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier: Hume and Kant on taste (Lessons 14–15).',
      body: 'Hume sought a "standard of taste" in qualified critics; Kant called beautiful what pleases universally and disinterestedly. Both treated taste as something we might get right. Pierre Bourdieu turns the question sideways: not "whose taste is correct?" but "where does taste come from?"',
      emoji: '🔄',
    },
    {
      type: 'concept',
      title: 'Taste as a Class Marker',
      body: 'In Distinction (1979), sociologist Pierre Bourdieu studied what French people liked. Preferences fell along class lines with startling regularity. Taste, he argued, isn\'t a private gift — it\'s "cultural capital," absorbed through upbringing and schooling, and used (often unconsciously) to mark and maintain social position.',
      visual: '📊',
      highlight: 'cultural capital',
    },
    {
      type: 'example',
      title: 'The Tour of the Museum',
      scenario: 'Two visitors see the same abstract painting. One, raised among books and galleries, reads its references with ease and feels at home. The other, never taught the "code," feels excluded, unsure how to look. Same canvas, opposite experience. The difference, Bourdieu says, is not innate sensitivity but inherited cultural capital.',
      source: 'Pierre Bourdieu, Distinction (1979)',
      emoji: '🏛️',
    },
    {
      type: 'quote',
      id: 'lq-aesthetics-aesthetics-25-1',
      quote: 'Taste classifies, and it classifies the classifier.',
      author: 'Pierre Bourdieu',
      era: '1979',
      work: 'Distinction',
    },
    {
      type: 'concept',
      title: 'The "Pure Gaze" Demystified',
      body: 'Kant\'s disinterested appreciation of pure form, Bourdieu noted, is itself a luxury. Only those freed from material need can afford to treat art as "art for art\'s sake." The supposedly universal aesthetic attitude is, in fact, the taste of a particular class — dressed up as human nature.',
      visual: '👁️',
      highlight: 'the pure gaze',
    },
    {
      type: 'dilemma',
      scenario: 'You genuinely adore obscure arthouse cinema and find blockbuster comedies dull. A friend, citing Bourdieu, teases that you only like difficult films because they signal you\'re cultured — your taste is social positioning in disguise. You feel the love is sincere, from the heart.',
      prompt: 'Is your refined taste really about distinction?',
      choices: [
        { id: 'sincere', label: 'No — I just genuinely respond to those films' },
        { id: 'social', label: 'Yes — my taste was shaped to mark my position' },
        { id: 'both', label: 'Both: sincere and socially shaped at once' },
      ],
      views: [
        { thinker: 'Pierre Bourdieu', stance: 'Taste is social position internalised', why: 'Your love feels sincere precisely because the habitus works unconsciously. You didn\'t choose to prefer the difficult; your upbringing installed dispositions that now feel like your own spontaneous heart.' },
        { thinker: 'A Kantian', stance: 'Genuine taste can still be free', why: 'That tastes correlate with class doesn\'t make every judgment a power move. You can disinterestedly find a film beautiful for its form, whatever your background. Origin and validity are different questions.' },
        { thinker: 'A pluralist', stance: 'Sincere and shaped aren\'t rivals', why: 'A feeling can be both authentically yours and socially produced. Recognising the social roots of your taste needn\'t cheapen the experience — it just makes you honest about where it came from.' },
      ],
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'The Politics of Liking',
      keyPoints: [
        'Bourdieu: taste tracks social class, not just temperament',
        'Cultural capital is absorbed through upbringing and schooling',
        'Taste marks and maintains social position',
        'The "disinterested" gaze is itself a class luxury',
      ],
      closingThought: 'The next time something strikes you as beautiful, ask quietly: who taught me to see it that way?',
    },
  ],
};

export default lesson;
