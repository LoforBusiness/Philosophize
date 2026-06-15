import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'political-political-28',
  slug: 'punishment-and-prisons',
  title: 'Why The State May Punish',
  description: 'Locking a person in a cage is the state\'s gravest act. What could possibly justify it?',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'The state takes years of a person\'s life. On what authority?',
      subtext: 'Punishment does deliberately what we forbid everyone else to do. It needs a reason.',
      emoji: '🔒',
    },
    {
      type: 'concept',
      title: 'Backward-Looking: Retribution',
      body: 'One justification looks to the past. The wrongdoer deserves to suffer in proportion to the wrong; punishment restores a moral balance. On this view, we punish because of the crime committed, full stop, not for any future benefit it might bring.',
      visual: '⚖️',
      highlight: 'desert',
    },
    {
      type: 'concept',
      title: 'Forward-Looking: Consequences',
      body: 'The other justification looks to the future. Punishment is worth its harm only if it does good: deterring others, protecting the public by incapacitation, or rehabilitating the offender. Suffering for its own sake adds nothing; what matters is the outcome.',
      visual: '➡️',
      highlight: 'deterrence',
    },
    {
      type: 'example',
      title: 'The Frame That "Works"',
      scenario: 'A town is gripped by riots. Punishing one innocent scapegoat would calm the mob and save many lives. A pure forward-looking view struggles to forbid it: the outcome is great. A backward-looking view forbids it flatly: he did nothing, so he deserves nothing. The case exposes what each theory really values.',
      source: 'A classic objection to utilitarian punishment',
      emoji: '😨',
    },
    {
      type: 'quote',
      id: 'lq-political-political-28-1',
      quote: 'Juridical punishment can never be administered merely as a means for promoting another good, but must in all cases be imposed only because the individual has committed a crime.',
      author: 'Immanuel Kant',
      era: '1797',
      work: 'The Metaphysics of Morals',
    },
    {
      type: 'reinforcement',
      callout: 'A third tradition rejects the whole frame.',
      body: 'Foucault asked not "is prison justified?" but "what does it do?" The modern prison, he argued, is less about punishing bodies than disciplining souls, training docile, watched, self-monitoring citizens. The cell is a technology of power, not just justice.',
      emoji: '👁️',
    },
    {
      type: 'question',
      prompt: 'Why is the "punish an innocent scapegoat to stop riots" case a problem mainly for forward-looking theories?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'They justify punishment by good outcomes, which the framing seems to deliver', isCorrect: true },
          { id: 'b', text: 'Because riots are never actually stopped by punishment', isCorrect: false },
          { id: 'c', text: 'Because retributivists love framing the innocent', isCorrect: false },
          { id: 'd', text: 'Because the scapegoat is secretly guilty', isCorrect: false },
        ],
        explanation: 'Tempting answer (c) inverts the logic. The case bites the forward-looking view precisely because, if only outcomes matter, framing an innocent that calms a deadly riot looks justified, which most of us find monstrous.',
      },
    },
    {
      type: 'dilemma',
      scenario: 'A guilty offender is genuinely reformed and poses zero future danger. Punishing him now deters no one and protects no one; it only imposes suffering for a past act. A judge must decide whether he still owes a sentence.',
      prompt: 'Should the reformed, harmless offender still be punished?',
      choices: [
        { id: 'a', label: 'Yes, he deserves it for what he did' },
        { id: 'b', label: 'No, punishment with no future benefit is pointless' },
        { id: 'c', label: 'A reduced sentence, balancing both concerns' },
      ],
      views: [
        {
          thinker: 'Retributivist (Kant)',
          stance: 'Desert demands punishment, regardless of benefit',
          why: 'Justice means treating people as responsible agents who get what their acts merit. To punish only when useful treats persons as tools for social ends, not as rational beings answerable for what they freely did.',
        },
        {
          thinker: 'Consequentialist',
          stance: 'No good outcome, no warrant to harm',
          why: 'Punishment is a real harm and must earn its keep. If no one is deterred, protected, or reformed, the suffering is gratuitous, dressing up vengeance as justice while doing nobody any actual good.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'The Cage And Its Reasons',
      keyPoints: [
        'Retribution looks back: the wrongdoer deserves it',
        'Consequentialism looks forward: deter, protect, reform',
        'The scapegoat case pressures pure outcome views',
        'Foucault asks what prisons do, not just justify',
      ],
      closingThought: 'When you say a sentence is "deserved," is it the past act or the future good that moves you?',
    },
  ],
};

export default lesson;
