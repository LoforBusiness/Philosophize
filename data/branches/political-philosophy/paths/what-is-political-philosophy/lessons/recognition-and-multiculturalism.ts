import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-24',
  slug: 'recognition-and-multiculturalism',
  title: 'The Politics Of Recognition',
  description: 'We need others to see us rightly. When a whole culture is misseen, is that an injustice?',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Being ignored can wound deeper than being attacked.',
      subtext: 'Taylor argues that how others see us can shape, or deform, who we become.',
      emoji: '👁️',
    },
    {
      type: 'concept',
      title: 'Identity Is Dialogical',
      body: 'Taylor argues we do not form our identities alone. We become who we are through conversation, through how the important people and groups around us recognize us. Recognition is not a courtesy added on top; it is part of how a self gets built.',
      visual: '💬',
      highlight: 'recognition',
    },
    {
      type: 'concept',
      title: 'Misrecognition As Harm',
      body: 'If recognition shapes identity, then misrecognition can injure. A society that mirrors a group back to itself as inferior, or simply renders it invisible, can inflict real damage, imprisoning people in a false and demeaning picture of themselves.',
      visual: '🪞',
      highlight: 'misrecognition',
    },
    {
      type: 'quote',
      id: 'lq-political-political-24-1',
      quote: 'Nonrecognition or misrecognition can inflict harm, can be a form of oppression, imprisoning someone in a false, distorted, and reduced mode of being.',
      author: 'Charles Taylor',
      era: '1992',
      work: 'The Politics of Recognition',
    },
    {
      type: 'example',
      title: 'A Language Fighting To Survive',
      scenario: 'A minority community asks that its language be taught, printed on signs, and used in courts. To outsiders this looks like a special favor. To the community it is survival: without public recognition, the language, and the way of life carried in it, fades within a generation. Recognition here is not symbolic. It is whether they get to keep existing.',
      source: 'Charles Taylor, The Politics of Recognition (1992)',
      emoji: '🗣️',
    },
    {
      type: 'concept',
      title: 'Equal Dignity vs. Equal Difference',
      body: 'Two demands pull apart. The politics of equal dignity says: treat everyone identically, ignore differences. The politics of difference says: recognize what makes each culture distinct. The tension is real, treating people the same can erase them; treating them differently can divide them.',
      visual: '⚖️',
      highlight: 'difference',
    },
    {
      type: 'question',
      prompt: 'A critic says: "Just treat everyone exactly the same; that settles it." Why might Taylor find this too quick?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Uniform treatment can ignore differences that are central to people\'s identities', isCorrect: true },
          { id: 'b', text: 'Because Taylor thinks all cultures are equally good in every respect', isCorrect: false },
          { id: 'c', text: 'Because equality is always unjust', isCorrect: false },
          { id: 'd', text: 'Because minorities should simply assimilate fully', isCorrect: false },
        ],
        explanation: 'The tempting "just treat everyone the same" assumes a neutral default. Taylor\'s point is that supposedly neutral treatment often reflects the majority\'s culture, so it can quietly suppress what makes a minority\'s identity distinctive.',
      },
    },
    {
      type: 'dilemma',
      scenario: 'A region grants its minority culture special protections: its own schools and language laws, even where this limits some individual choices. A young member wants to leave the tradition entirely. Does protecting the culture wrongly trap individuals, or does refusing protection doom the culture?',
      prompt: 'Should group recognition override individual exit?',
      choices: [
        { id: 'a', label: 'Protect the culture; collective survival matters' },
        { id: 'b', label: 'Protect the individual; rights belong to persons' },
        { id: 'c', label: 'Protect the culture but guarantee a right to leave' },
      ],
      views: [
        {
          thinker: 'Charles Taylor',
          stance: 'Cultures can hold collective goals worth protecting',
          why: 'Some goods, like a surviving language, exist only collectively. A liberalism blind to this leaves vulnerable cultures to be ground down, even though belonging to them is central to its members\' very identities.',
        },
        {
          thinker: 'Liberal individualists',
          stance: 'Rights protect persons, not cultures',
          why: 'Cultures matter only because individuals value them. If a member wants out, the group must not cage her. Protections that override personal freedom risk sacrificing real people to an abstraction called the community.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'Seen, Or Misseen',
      keyPoints: [
        'Identity is formed dialogically, through recognition by others',
        'Misrecognition can be a genuine harm',
        'Equal dignity and equal difference pull apart',
        'Group recognition can clash with individual exit',
      ],
      closingThought: 'When a group demands to be "seen," ask what is really at stake: courtesy, or survival?',
    },
  ],
};

export default lesson;
