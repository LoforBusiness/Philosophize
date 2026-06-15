import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-23',
  slug: 'communitarianism-vs-liberalism',
  title: 'The Self In Society',
  description: 'Are you a free chooser stripped of all ties, or a self made by your community?',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Strip away your family, faith, and country. Who is left?',
      subtext: 'Liberals say the real you. Communitarians say almost nothing at all.',
      emoji: '🪞',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier Rawls asked you to choose principles behind a "veil of ignorance."',
      body: 'In Justice as Fairness, Rawls imagined choosers who set aside their religion, class, and history to pick fair rules. Communitarians ask: is such a stripped-down chooser even a real person?',
      emoji: '🎭',
    },
    {
      type: 'concept',
      title: 'The Unencumbered Self',
      body: 'Liberals like Rawls picture the self as prior to its ends: you exist first, then choose your goals and attachments freely. On this view, no commitment defines you so deeply that you could not, in principle, revise or abandon it.',
      visual: '🎈',
      highlight: 'prior to its ends',
    },
    {
      type: 'concept',
      title: 'The Situated Self',
      body: 'Sandel answers: some attachments are not chosen but discovered. You find yourself already a daughter, a citizen, a member of a tradition. These ties partly constitute who you are; remove them and there is no neutral "you" left underneath to do the choosing.',
      visual: '🌳',
      highlight: 'constitute who you are',
    },
    {
      type: 'quote',
      id: 'lq-political-political-23-1',
      quote: 'We cannot regard ourselves as independent in this way without great cost to those loyalties and convictions whose moral force consists partly in the fact that living by them is inseparable from understanding ourselves as the particular persons we are.',
      author: 'Michael Sandel',
      era: '1982',
      work: 'Liberalism and the Limits of Justice',
    },
    {
      type: 'example',
      title: 'The Tradition You Were Born Into',
      scenario: 'MacIntyre points to a person raised in a craft, a faith, a people. Their very idea of a good life comes from stories the community told them. Asked to choose values from nowhere, they have no compass. Morality, he argues, only makes sense inside a tradition that already gives words like "virtue" their meaning.',
      source: 'Alasdair MacIntyre, After Virtue (1981)',
      emoji: '📜',
    },
    {
      type: 'question',
      prompt: 'What does the communitarian critique mainly target in Rawls\'s theory?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Its picture of the self as choosing values prior to any attachment', isCorrect: true },
          { id: 'b', text: 'Its claim that the rich deserve all of their wealth', isCorrect: false },
          { id: 'c', text: 'Its demand that everyone share the same religion', isCorrect: false },
          { id: 'd', text: 'Its insistence that communities never matter at all', isCorrect: false },
        ],
        explanation: 'Tempting answers caricature both sides. Rawls never says the rich deserve everything, nor that community is worthless. The real target is metaphysical: the image of an "unencumbered" self that exists prior to its ends and ties.',
      },
    },
    {
      type: 'dilemma',
      scenario: 'A town wants to ban a megastore to protect its tight-knit local shops and shared way of life. A newcomer protests: the state should stay neutral and let individuals freely choose where to shop, not enforce one vision of the good community.',
      prompt: 'Should the state protect a shared way of life?',
      choices: [
        { id: 'a', label: 'No, the state must stay neutral among ways of life' },
        { id: 'b', label: 'Yes, communities may protect their shared identity' },
        { id: 'c', label: 'Only if a clear majority democratically agrees' },
      ],
      views: [
        {
          thinker: 'Liberals (Rawls)',
          stance: 'The state should not pick favored ways of life',
          why: 'Justice means fair rules that let diverse people pursue their own conceptions of the good. Enforcing one community\'s vision wrongs those who do not share it and treats them as means to others\' ends.',
        },
        {
          thinker: 'Communitarians (Sandel, MacIntyre)',
          stance: 'Shared goods are worth defending together',
          why: 'A community is not just a marketplace of individuals; its common life shapes who its members are. Politics that pretends to be neutral often just lets market forces dissolve the very bonds that give lives meaning.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'Unencumbered Or Situated?',
      keyPoints: [
        'Liberals: the self chooses its ends freely',
        'Communitarians: the self is partly made by its ties',
        'At stake: whether the state can stay neutral',
        'Both prize freedom, but picture the self differently',
      ],
      closingThought: 'Are your deepest commitments things you picked, or things that made you who you are?',
    },
  ],
};

export default lesson;
