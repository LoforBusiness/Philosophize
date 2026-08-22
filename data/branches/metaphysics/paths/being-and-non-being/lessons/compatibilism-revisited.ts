import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-16',
  slug: 'compatibilism-revisited',
  title: 'Free Enough to Be Responsible?',
  description: 'Maybe freedom was never about escaping causes, but about which causes move you.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Two addicts take the drug. Only one of them is unfree.',
      subtext: 'What if the difference lies inside what they want?',
      emoji: '⛓️',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw a way out of the determinist trap.',
      body: 'Earlier you met compatibilism: free means unforced, not uncaused. And you saw that being caused need not mean being compelled. Frankfurt now asks a sharper question — not whether your wants are caused, but whether they are truly yours.',
      emoji: '🔁',
    },
    {
      type: 'concept',
      title: 'Wanting What You Want to Want',
      body: 'You have first-order desires — wanting coffee, wanting the drug. But you can also reflect and form a second-order desire: wanting to want, or wishing you did not. Frankfurt says you are free when your will lines up with the desires you reflectively endorse.',
      visual: '🪞',
      highlight: 'second-order desire',
    },
    {
      type: 'example',
      title: 'The Willing and the Unwilling Addict',
      scenario: 'Both addicts feel the same craving and both take the drug. The willing addict endorses the urge — he wants to want it. The unwilling addict is dragged along by a craving he despises and wishes were gone. Same act, same chemistry. Yet only one is moved by a will he can call his own.',
      emoji: '💉',
      source: 'Frankfurt, Freedom of the Will and the Concept of a Person (1971)',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-16-1',
      quote: 'It is in securing the conformity of his will to his second-order volitions, then, that a person exercises freedom of the will.',
      author: 'Harry Frankfurt',
      era: '1971',
      work: 'Freedom of the Will and the Concept of a Person',
      philosopherId: 'harry-frankfurt',
    },
    {
      type: 'dilemma',
      scenario: 'A willing addict takes the drug, fully endorsing the desire and glad to have it. An unwilling addict takes the same drug while hating that he wants it, struggling against a craving he disowns. Their behaviour and their bodies are identical.',
      prompt: 'Are the two addicts equally unfree?',
      choices: [
        { id: 'a', label: 'Yes — both are driven by craving, so neither is free' },
        { id: 'b', label: 'No — only the unwilling addict acts against his real will' },
        { id: 'c', label: 'Freedom does not apply; both desires were caused' },
      ],
      views: [
        {
          thinker: 'Harry Frankfurt',
          stance: 'The willing addict is free; the unwilling one is not.',
          why: 'Freedom is matching your will to the desires you endorse. The willing addict wants to want the drug, so the will moving him is his own. The unwilling addict is captured by a craving he disowns.',
        },
        {
          thinker: "Baron d'Holbach",
          stance: 'Neither is free — every desire is caused.',
          why: 'For the hard determinist, both cravings and both reflections were fixed by prior causes. Endorsing a desire is just one more link in the chain, so calling either addict free is an illusion.',
        },
        {
          thinker: 'David Hume',
          stance: 'Both are free if nothing external forces them.',
          why: 'For the classical compatibilist, freedom is simply acting without outside compulsion. Since no one drags either addict to the drug, both act freely — the inner war over wanting does not change that.',
        },
      ],
      xpValue: 5,
    },
    {
      // The cinematic scene asks this one on the stage, by tapping the addict whose
      // second-order arrow points against his own craving (E37c).
      type: 'question',
      prompt: 'Two addicts, identical cravings and identical behaviour. Which one is unfree, for Frankfurt?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'The one who wishes he did not want it', isCorrect: true },
          { id: 'b', text: 'Both, since both cravings are caused', isCorrect: false },
          { id: 'c', text: 'Neither, since both take the drug willingly', isCorrect: false },
        ],
        explanation: 'Their bodies and their chemistry are identical, so nothing about the act can separate them. The unwilling addict is moved by a will he disowns; the willing one endorses his. Option B is hard determinism, which Frankfurt rejects — he is a compatibilist and does not mind the desires being caused at all.',
      },
    },
    {
      type: 'question',
      prompt: 'A friend says: "Frankfurt proves we are free because our choices are uncaused." Where does this go wrong?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'It is right — Frankfurt rejects all causes of desire', isCorrect: false },
          { id: 'b', text: 'It confuses freedom with randomness, just as quantum chance did earlier', isCorrect: false },
          { id: 'c', text: 'It misreads Frankfurt: he locates freedom in endorsing your will, not in escaping causes', isCorrect: true },
          { id: 'd', text: 'It is right — second-order desires have no causes', isCorrect: false },
        ],
        explanation: 'This is the straw-man trap: it swaps Frankfurt\'s actual claim for an easier one. He is a compatibilist — your desires can be fully caused. Freedom comes from your will conforming to the second-order desires you reflectively endorse, never from being uncaused.',
      },
    },
    {
      type: 'summary',
      title: 'Which Causes Are Yours',
      keyPoints: [
        'Freedom is endorsing your will, not escaping causes',
        'Second-order desires: wanting what you want to want',
        'Willing addict acts freely; unwilling addict does not',
        'Hard determinists and Hume locate freedom elsewhere',
      ],
      closingThought: 'You now know freedom can survive a caused world — what matters is whether the will moving you is one you would choose to have.',
    },
  ],
};

export default lesson;
