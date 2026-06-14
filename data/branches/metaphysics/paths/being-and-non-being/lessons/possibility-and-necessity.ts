import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'metaphysics-being-14',
  slug: 'possibility-and-necessity',
  title: 'Could The World Have Been Otherwise?',
  description: "Some truths could have been false. Some never could. What's the difference?",
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'You exist. But did you have to?',
      subtext: 'Some facts could have gone another way. A few never could.',
      emoji: '🌌',
    },
    {
      type: 'concept',
      title: 'Two flavors of true',
      body: "'2 + 2 = 4' could not have been false — flip the universe however you like, it holds. 'Paris is in France' is true, but easily otherwise; borders shift, names change. Philosophers call the first necessary and the second contingent.",
      highlight: 'necessary vs. contingent',
      visual: '⚖️',
    },
    {
      type: 'concept',
      title: 'Possible worlds',
      body: "Leibniz gave 'could have been' a precise picture: imagine every way reality could consistently have gone — infinite possible worlds. A truth is necessary if it holds in all of them, contingent if it holds in some but not others. Ours is just the world that won.",
      highlight: 'possible worlds',
      visual: '🪐',
    },
    {
      type: 'quote',
      id: 'lq-metaphysics-being-14',
      quote: "There are infinite possible worlds in God's ideas, and as only one of them can exist, there must be a sufficient reason for God's choice.",
      author: 'Gottfried Wilhelm Leibniz',
      era: '1714',
      work: 'Monadology, §53',
      philosopherId: 'gottfried-leibniz',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you saw the determinist ask…',
      body: "'Could you have done otherwise?' Modality turns that into a sharper question: is there a possible world where you chose differently? If yes, your act was contingent. If no, it was necessary — and freedom looks fragile.",
      emoji: '🔗',
    },
    {
      type: 'concept',
      title: 'Degrees of must',
      body: "Necessity comes in grades. Definitions are necessary almost trivially ('triangles have three sides'). Kripke argued some scientific identities — 'water is H2O' — are necessary too, yet we only discovered them by looking. Necessary, but learned the hard way: necessary a posteriori.",
      highlight: 'necessary a posteriori',
      visual: '💧',
    },
    {
      type: 'example',
      title: 'Order them by force',
      scenario: "Rank four claims from the firmest 'could-not-be-otherwise' to the freest 'just-happens-to-be'. A triangle's three sides; that every effect has a cause; that water is H2O; that it is raining in London right now. Which is locked tight by meaning, and which depends entirely on today's weather?",
      emoji: '🪜',
    },
    {
      type: 'question',
      prompt: 'Sort these from most necessary to most contingent.',
      xpValue: 5,
      interaction: {
        type: 'sort',
        items: [
          { id: 'triangle', text: 'A triangle has three sides' },
          { id: 'cause', text: 'Every effect has a cause' },
          { id: 'water', text: 'Water is H2O' },
          { id: 'rain', text: 'It is raining in London right now' },
        ],
        correctOrder: ['triangle', 'water', 'cause', 'rain'],
        explanation:
          "'Triangle has three sides' is necessary by definition — denying it is incoherent. 'Water is H2O' is necessary too (Kripke: nothing else could be water), but we learned it empirically, so it sits just below the definitional case. 'Every effect has a cause' feels necessary yet is genuinely contested, so its modal force is weaker. 'Raining in London' is purely contingent — false in countless possible worlds. The trap is sorting by how obvious or certain a claim feels rather than by modal force: 'water is H2O' is less obvious than the causal principle, yet far more necessary.",
      },
    },
    {
      type: 'summary',
      title: 'What you now know',
      keyPoints: [
        'Necessary truths hold in every possible world',
        'Contingent truths hold here, not everywhere',
        'Leibniz made "could have been" precise',
        'Some necessities are learned, not obvious',
      ],
      closingThought:
        "Next time someone says 'it could have been otherwise', ask which world they mean — and whether any world could hold it false.",
    },
  ],
};

export default lesson;
