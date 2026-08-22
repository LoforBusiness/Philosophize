import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-15',
  slug: 'is-morality-real',
  title: 'Is Morality Real, Or Just How We Feel?',
  description: 'When you say cruelty is wrong, are you stating a fact — or just booing?',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Is "cruelty is wrong" a fact, or a boo?',
      subtext: 'When you condemn cruelty, are you reporting reality — or just expressing how you feel?',
      emoji: '👎',
    },
    {
      type: 'concept',
      title: 'Two Rival Pictures',
      body: 'Moral realism says some moral claims are objectively true, like facts about the world. Emotivism disagrees: a moral claim only voices an attitude. "Cruelty is wrong" really means "Cruelty — boo!" The fight is whether ethics describes facts or just feelings.',
      highlight: 'emotivism',
      visual: '⚖️',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you weighed universal vs relative morality.',
      body: 'You once asked whether moral rules hold for everyone or shift by culture. Now go one level deeper: before asking who a rule binds, ask whether there are any moral FACTS at all to be universal about.',
      emoji: '🔁',
    },
    {
      type: 'example',
      title: 'The "Boo!" Theory',
      scenario: 'In 1936 the young philosopher A.J. Ayer argued that saying "You acted wrongly in stealing" adds no fact to "You stole." It only adds a tone of disapproval — a verbal wince. Moral words, he claimed, don\'t state truths you could verify; they vent feeling, like booing at a play you dislike.',
      source: 'A.J. Ayer, Language, Truth and Logic',
      emoji: '🎭',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-15-1',
      quote: 'If I say to someone, "You acted wrongly in stealing that money," I am not stating anything more than if I had simply said, "You stole that money."',
      author: 'A.J. Ayer',
      era: '1936',
      work: 'Language, Truth and Logic',
      philosopherId: 'aj-ayer',
    },
    {
      // The cinematic scene asks this one on the stage (E37c) — same concept,
      // re-cut so the reader taps the claim rather than reading four of them.
      type: 'question',
      prompt: 'According to emotivism, what does the word "wrongly" add to "You stole that money"?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A feeling, and not a claim at all', isCorrect: true },
          { id: 'b', text: 'A further fact about the act', isCorrect: false },
          { id: 'c', text: 'A fact about how the speaker feels', isCorrect: false },
        ],
        explanation: 'Option C is the trap, and it is worth slowing down for: "I disapprove of stealing" IS a claim — it can be true or false, and you could check it by watching the speaker. That view is subjectivism, not emotivism. Emotivism says the moral word does not REPORT the disapproval; it performs it, the way booing does. Option B is moral realism, the position emotivism is arguing against.',
      },
    },
    {
      type: 'question',
      prompt: 'What does emotivism actually claim about a statement like "Cruelty is wrong"?',
      interaction: {
        type: 'multiple-choice',
        options: [
          {
            id: 'a',
            text: 'It expresses an attitude rather than stating a fact.',
            isCorrect: true,
          },
          {
            id: 'b',
            text: 'It is proven false because cultures disagree about morals.',
            isCorrect: false,
          },
          {
            id: 'c',
            text: 'It is a verifiable scientific fact about human behavior.',
            isCorrect: false,
          },
          {
            id: 'd',
            text: 'It is always true for everyone, everywhere, without exception.',
            isCorrect: false,
          },
        ],
        explanation:
          'Emotivism is the CLAIM that moral statements voice attitudes ("Cruelty — boo!") rather than state facts — a position, not a proof. Option B is the tempting trap: the argument-from-disagreement fallacy. That people disagree about a topic does not show there is no fact of the matter — people once disagreed about the shape of the Earth, yet it has one. Realists reply that moral disagreement is fully compatible with there being moral truths we are still arguing toward.',
      },
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Moral realism: some moral claims are objectively true.',
        'Emotivism: moral claims merely express attitudes.',
        'Disagreement alone never disproves a fact.',
      ],
      closingThought:
        'Whether ethics describes facts or feelings is still live — but now you can spot when "people disagree" is doing more work than it can bear.',
    },
  ],
};

export default lesson;
