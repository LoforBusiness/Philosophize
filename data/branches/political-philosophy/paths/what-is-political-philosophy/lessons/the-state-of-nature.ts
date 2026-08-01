import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-11',
  slug: 'the-state-of-nature',
  title: 'Why Leave the State of Nature?',
  description:
    'Three thinkers imagine life with no government, and reach three different verdicts.',
  estimatedMinutes: 5,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Erase every government. What is left of us?',
      subtext: 'Three great thinkers ran this experiment and disagreed completely.',
      emoji: '🏚️',
    },
    {
      type: 'reinforcement',
      callout: 'Earlier you asked what makes government legitimate, and where rights come from.',
      body:
        'Those answers rest on a deeper foundation. To justify any government, philosophers first imagined humanity with none at all — then asked what we would rationally agree to build.',
      emoji: '🧱',
    },
    {
      type: 'concept',
      title: 'The State of Nature',
      body:
        'A thought experiment: picture people before laws, police, or rulers. What is life like? Your answer decides what government you can justify. It is not history — it is a tool for testing why we consent to be governed at all.',
      visual: '🌲',
      highlight: 'state of nature',
    },
    {
      type: 'example',
      title: 'Three Verdicts, One Question',
      scenario:
        'Hobbes looked and saw terror: with no shared power, every person fears every other, so life is "solitary, poor, nasty, brutish, and short." Locke saw freedom that was real but insecure — fine until disputes turn violent. Rousseau saw something gentler still: people once innocent and free, only later corrupted by society itself.',
      source: 'Hobbes, Locke, Rousseau (17th–18th c.)',
      emoji: '⚖️',
    },
    {
      type: 'quote',
      id: 'lq-political-political-11',
      quote:
        'During the time men live without a common power to keep them all in awe, they are in that condition which is called war.',
      author: 'Thomas Hobbes',
      era: '1651',
      work: 'Leviathan',
      philosopherId: 'thomas-hobbes',
    },
    {
      type: 'question',
      prompt: 'Hobbes says life without a state is a war of all against all. What government does that diagnosis demand?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'One absolute sovereign, strong enough to overawe everyone', isCorrect: true },
          { id: 'b', text: 'A limited government that protects rights we already hold', isCorrect: false },
          { id: 'c', text: 'No government — people are better left alone', isCorrect: false },
          { id: 'd', text: 'A community bound to the general will of all', isCorrect: false },
        ],
        explanation: 'The cure has to fit the disease. If the problem is that nobody can be trusted, only a power above everyone can hold the peace — so Hobbes trades nearly all freedom for safety. Option (b) is Locke\'s cure and (d) is Rousseau\'s: same experiment, different diagnosis, different state.',
      },
    },
    {
      type: 'dilemma',
      scenario:
        'Imagine the lights go out for good: no state, no courts, no police — just people and their neighbors. You must decide what to build before anyone acts. The question is not what you fear, but what you believe people, left to themselves, truly are.',
      prompt: 'With no government, what is human life really like?',
      choices: [
        { id: 'a', label: 'A war of all against all' },
        { id: 'b', label: 'Free but dangerously insecure' },
        { id: 'c', label: 'Innocent, until society corrupts us' },
      ],
      views: [
        {
          thinker: 'Thomas Hobbes',
          stance: 'A war of all against all',
          why:
            'Without a common power, equal fear and scarce goods drive everyone to strike first. So we surrender our freedom to one absolute sovereign — any peace beats endless war.',
        },
        {
          thinker: 'John Locke',
          stance: 'Free but insecure',
          why:
            'Reason and natural rights already govern us, but no neutral judge enforces them. So we form a limited government for one job: to protect the life, liberty, and property we already own.',
        },
        {
          thinker: 'Jean-Jacques Rousseau',
          stance: 'Innocent, then corrupted',
          why:
            'Early humans were free and good; private property and society bred inequality and chains. A just contract must restore freedom by binding us to the "general will" — the common good.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'question',
      prompt:
        'A friend says: "Hobbes, Locke, and Rousseau disagree because each wanted a different government." What is the deeper truth?',
      interaction: {
        type: 'multiple-choice',
        options: [
          {
            id: 'a',
            text: 'They started from different views of human nature, so different contracts followed.',
            isCorrect: true,
          },
          {
            id: 'b',
            text: 'They each chose the government they wanted, then invented a state of nature to fit it.',
            isCorrect: false,
          },
          {
            id: 'c',
            text: 'They actually agreed; the differences are just old-fashioned wording.',
            isCorrect: false,
          },
          {
            id: 'd',
            text: 'They disagreed only because they lived in different countries.',
            isCorrect: false,
          },
        ],
        explanation:
          'Option B reverses cause and effect — the "motivated reasoning" trap. It assumes each thinker picked a conclusion first and reverse-engineered the premise. But their argument runs forward: the diagnosis of human nature (fearful, rational, or innocent) drives the contract that follows. Get the premise wrong and the whole structure changes.',
      },
      xpValue: 5,
    },
    {
      type: 'quote',
      id: 'lq-political-political-11-2',
      quote:
        'Man is born free, and everywhere he is in chains.',
      author: 'Jean-Jacques Rousseau',
      era: '1762',
      work: 'The Social Contract',
      philosopherId: 'jean-jacques-rousseau',
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'The state of nature is a tool, not history.',
        'Hobbes feared war; Locke saw insecurity; Rousseau saw lost innocence.',
        'Each diagnosis built a different social contract.',
        'Contract theory underlies legitimacy and rights alike.',
      ],
      closingThought:
        'Every argument about government secretly begins with a claim about who we are.',
    },
  ],
};

export default lesson;
