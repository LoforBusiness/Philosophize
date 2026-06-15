import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-27',
  slug: 'metaethics-where-morals-live',
  title: 'When You Say "That’s Wrong"',
  description: 'Are you stating a fact, reporting your culture, or just voicing a feeling?',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: '"That’s wrong." Is it a fact, a custom, or a feeling?',
      subtext: 'Normal ethics asks what to do. Metaethics asks what we are even doing when we say it.',
      emoji: '🔬',
    },
    {
      type: 'concept',
      title: 'A Step Back: Metaethics',
      body: 'Most ethics debates which acts are right. Metaethics steps back and asks about the nature of moral talk itself. When you say "cruelty is wrong," are you describing a real fact, reporting your society’s rules, or expressing an attitude? Three big answers compete.',
      visual: '🪞',
      highlight: 'metaethics',
    },
    {
      type: 'concept',
      title: 'Realism vs Relativism vs Expressivism',
      body: 'Moral realism: there are objective moral facts, true everywhere — "cruelty is wrong" is true like "water is H₂O." Relativism: moral claims are true only relative to a culture or person. Expressivism: moral statements don’t describe facts at all; they express feelings — "Boo, cruelty!" — and can be neither true nor false.',
      visual: '🔱',
      highlight: 'realism, relativism, expressivism',
    },
    {
      type: 'example',
      title: 'Three Readings Of One Sentence',
      scenario: 'A friend says, "Torturing children for fun is wrong." A realist hears a claim that is just plain true, discovered not invented. A relativist hears "wrong in our culture," with no universal standing. An expressivist hears a cry of disgust — "How horrible!" — dressed in the grammar of a statement. Same words, three theories of what they mean.',
      emoji: '🗣️',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-27-1',
      quote: 'There are no moral facts.',
      author: 'Friedrich Nietzsche',
      era: '1889',
      work: 'Twilight of the Idols',
    },
    {
      type: 'question',
      prompt: 'A relativist says, "No moral claim is true for everyone." Why do critics call this self-undermining?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'Because it proves moral realism is obviously correct', isCorrect: false },
          { id: 'b', text: 'Because the claim itself is stated as a universal truth about all morality', isCorrect: true },
          { id: 'c', text: 'Because relativists secretly believe in objective facts', isCorrect: false },
          { id: 'd', text: 'Because cultures never actually disagree', isCorrect: false },
        ],
        explanation: 'Option A is the tempting trap: spotting a flaw in relativism does not hand victory to realism (expressivism is still standing). The precise objection is narrower. The slogan "no moral claim holds for everyone" is itself offered as holding for everyone — a universal claim denying universal claims. That tension is what critics mean by self-undermining; it does not by itself prove any rival true.',
      },
    },
    {
      type: 'dilemma',
      scenario: 'Two societies clash. One practices something the other finds monstrous. A realist says one side is simply mistaken about a moral fact. A relativist says each is right within its own culture, so cross-cultural criticism makes no sense. An expressivist says both are voicing attitudes — passionate, but not true or false.',
      prompt: 'What are we doing when moralities collide?',
      choices: [
        { id: 'a', label: 'Disputing a fact one side gets wrong' },
        { id: 'b', label: 'Reporting incompatible cultural codes' },
        { id: 'c', label: 'Expressing clashing attitudes' },
      ],
      views: [
        {
          thinker: 'Moral realist',
          stance: 'One side is objectively mistaken.',
          why: 'Just as cultures can be wrong about astronomy, they can be wrong about ethics. Otherwise we could not say slavery was always wrong, only that we happen to dislike it. Real progress requires real facts to get closer to.',
        },
        {
          thinker: 'Relativist',
          stance: 'Each is valid within its own frame.',
          why: 'Moralities are products of cultures, like languages. Judging another society by your standards just smuggles in your code as if it were universal. Tolerance, not a fictitious "true morality," is the honest response to deep disagreement.',
        },
        {
          thinker: 'Expressivist (Ayer)',
          stance: 'Both sides are voicing feelings.',
          why: 'Moral sentences lack truth-value; they vent approval or disapproval. The clash is real and can move us to act, but it is a conflict of attitudes, not a dispute over facts waiting to be discovered.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Metaethics asks what moral talk really is',
        'Realism: objective moral facts exist',
        'Relativism: truth is relative to culture',
        'Expressivism: moral claims express attitudes',
      ],
      closingThought: 'Before arguing what is right, it helps to know what kind of thing "right" even is.',
    },
  ],
};

export default lesson;
