import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-26',
  slug: 'deliberative-democracy',
  title: 'Democracy As Conversation',
  description: 'Is democracy just counting heads, or is it the reasons we give before we vote?',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'A vote can count millions of opinions and weigh none of them.',
      subtext: 'Habermas asks: shouldn\'t democracy be about reasons, not just totals?',
      emoji: '🗳️',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you weighed democracy against its critics.',
      body: 'In Democracy and Its Critics you saw worries that majorities can be ignorant or tyrannical. Deliberative democracy answers: the cure is not less democracy, but better public reasoning before the vote.',
      emoji: '🔁',
    },
    {
      type: 'concept',
      title: 'Aggregation vs. Deliberation',
      body: 'One picture of democracy just adds up fixed preferences, like a vending machine taking coins. Deliberative democracy says legitimacy comes earlier: from citizens publicly exchanging reasons, where positions can actually change because the better argument, not the louder voice, wins.',
      visual: '💬',
      highlight: 'public reasoning',
    },
    {
      type: 'quote',
      id: 'lq-political-political-26-1',
      quote: 'No force except that of the better argument is exercised; and that, as a result, all motives except that of the cooperative search for truth are excluded.',
      author: 'Jürgen Habermas',
      era: '1971',
      work: 'Knowledge and Human Interests',
    },
    {
      type: 'concept',
      title: 'The Ideal Speech Situation',
      body: 'Habermas imagines a yardstick: a conversation where everyone may speak, no one is silenced by power or fear, and only reasons carry weight. Real debate never fully reaches it, but it shows us what makes some public talk genuinely legitimate and other talk mere manipulation.',
      visual: '🎚️',
      highlight: 'the better argument',
    },
    {
      type: 'example',
      title: 'The Citizens\' Assembly',
      scenario: 'A divisive law is sent not to a snap referendum but to a randomly chosen citizens\' assembly. For weeks they hear experts, question each other, and reason together. Many arrive with hardened views and leave with changed ones, not because they were pressured, but because someone made a better case.',
      source: 'Inspired by Habermas, Between Facts and Norms (1992)',
      emoji: '🧑‍🤝‍🧑',
    },
    {
      type: 'question',
      prompt: 'On the deliberative view, why is a snap referendum, with no debate, a weak source of legitimacy?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It merely tallies pre-set preferences without testing them through reasons', isCorrect: true },
          { id: 'b', text: 'Because voting is always illegitimate', isCorrect: false },
          { id: 'c', text: 'Because experts should decide instead of citizens', isCorrect: false },
          { id: 'd', text: 'Because the majority is usually wrong', isCorrect: false },
        ],
        explanation: 'Tempting answers (c) and (d) read deliberation as anti-democratic elitism. It is the opposite: legitimacy comes from citizens reasoning together. The complaint is that bare aggregation skips that reasoning, counting opinions it never asked anyone to justify.',
      },
    },
    {
      type: 'dilemma',
      scenario: 'A government must decide a contested issue. Option one: hold a quick national vote and follow the majority. Option two: convene a deliberative assembly that debates for months, then recommends. The vote is faster and more equal in raw numbers; the assembly is slower but reasoned.',
      prompt: 'Which better confers democratic legitimacy?',
      choices: [
        { id: 'a', label: 'The quick majority vote; every head counts equally' },
        { id: 'b', label: 'The deliberative assembly; reasons were tested' },
        { id: 'c', label: 'Neither alone; combine debate then a vote' },
      ],
      views: [
        {
          thinker: 'Jürgen Habermas',
          stance: 'Legitimacy flows from reasoned public debate',
          why: 'A decision binds us justly when it could be defended to everyone affected by reasons they could accept. Mere counting skips that test, so deliberation, not the tally alone, is the deeper source of legitimacy.',
        },
        {
          thinker: 'Aggregative democrats',
          stance: 'Equal votes best respect equal citizens',
          why: 'Deliberation can be captured by the articulate and well-resourced. One person, one vote treats everyone as a political equal without privileging those who argue well, and protects against talk that merely dresses up power.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'Counting Or Reasoning?',
      keyPoints: [
        'Aggregation just sums fixed preferences',
        'Deliberation tests preferences through public reasons',
        'Legitimacy: a decision defensible to all affected',
        'The ideal: only the better argument wins',
      ],
      closingThought: 'Before the next big vote, ask: did we reason together, or just tally what we already felt?',
    },
  ],
};

export default lesson;
