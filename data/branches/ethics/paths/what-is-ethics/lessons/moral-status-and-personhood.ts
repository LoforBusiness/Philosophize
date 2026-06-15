import type { Lesson } from '@/data/types';

const lesson: Lesson = {
  id: 'ethics-ethics-26',
  slug: 'moral-status-and-personhood',
  title: 'Who Counts, And Why?',
  description: 'Rocks don’t matter morally. Your friend does. Where is the line, and what draws it?',
  estimatedMinutes: 6,
  xpReward: 25,
  cards: [
    {
      type: 'hook',
      headline: 'Kicking a rock is fine. Kicking a dog is not. Why?',
      subtext: 'Some things we must take into account morally. Others we can ignore. What puts you on the list?',
      emoji: '🐾',
    },
    {
      type: 'concept',
      title: 'Moral Status',
      body: 'A being has moral status if it matters morally for its own sake — if we owe it consideration, not just because of how it affects us. The deep question is which feature grants that standing: being human, being able to suffer, being rational and self-aware, or something else.',
      visual: '⭐',
      highlight: 'matters for its own sake',
    },
    {
      type: 'concept',
      title: 'Three Candidate Criteria',
      body: 'Sentience: the capacity to feel pleasure and pain — this brings in many animals. Personhood: rationality, self-awareness, planning for a future — a higher bar that some animals may meet and some humans may not. Species membership: simply being human. Each line includes and excludes different beings.',
      visual: '🪜',
      highlight: 'sentience, personhood, species',
    },
    {
      type: 'quote',
      id: 'lq-ethics-ethics-26-1',
      quote: 'The question is not, Can they reason? nor, Can they talk? but, Can they suffer?',
      author: 'Jeremy Bentham',
      era: '1789',
      work: 'An Introduction to the Principles of Morals and Legislation',
      philosopherId: 'jeremy-bentham',
    },
    {
      type: 'example',
      title: 'Person vs Human',
      scenario: 'Philosophers split two ideas we usually merge. "Human" is a biological category. "Person" names a being with self-awareness, reason, and a sense of its own future. Most humans are persons — but the concepts can come apart. A future intelligent alien or AI might be a person without being human. The criterion you pick decides who lands inside the circle.',
      emoji: '🧩',
    },
    {
      type: 'question',
      prompt: 'Someone says: "Only humans have moral status, simply because they are human." What is this position usually accused of being?',
      xpValue: 5,
      interaction: {
        type: 'multiple-choice',
        options: [
          { id: 'a', text: 'A neutral biological fact with no moral assumptions', isCorrect: false },
          { id: 'b', text: 'Speciesism — favoring one’s own species without a morally relevant reason', isCorrect: true },
          { id: 'c', text: 'A form of utilitarianism', isCorrect: false },
          { id: 'd', text: 'The same as the harm principle', isCorrect: false },
        ],
        explanation: 'Option A is the tempting trap: it treats "they’re human" as a self-evident reason. Critics like Singer reply that species membership alone is not morally relevant — it is a biological label, not a capacity like suffering or reason. Favoring humans just for being human, they argue, parallels racism or sexism in form. That is the charge of speciesism. You can resist it, but you must say what morally relevant feature humanity tracks.',
      },
    },
    {
      type: 'dilemma',
      scenario: 'A research lab must choose how to weigh interests. A chimpanzee shows complex emotion, self-recognition, and clear suffering. A human patient is permanently unconscious with no chance of recovery and no awareness. Resources force a hard comparison of whose interests count more.',
      prompt: 'Whose moral status weighs more here?',
      choices: [
        { id: 'a', label: 'The human, simply for being human' },
        { id: 'b', label: 'The chimpanzee, who can still suffer and feel' },
        { id: 'c', label: 'They are exactly equal' },
      ],
      views: [
        {
          thinker: 'Peter Singer',
          stance: 'Weigh capacities, not species labels.',
          why: 'What matters is the capacity to suffer and to have interests. A self-aware, feeling chimpanzee has more at stake than a permanently unconscious being. To rank by species alone is speciesism, an arbitrary prejudice.',
        },
        {
          thinker: 'Kantian',
          stance: 'Persons command unconditional respect.',
          why: 'Moral status flows from rational agency and dignity, not mere sentience. Even an impaired human belongs to a kind of being owed respect, while animals, lacking rational autonomy, fall outside that special circle of ends-in-themselves.',
        },
        {
          thinker: 'Care ethicist',
          stance: 'Look at relationships, not just capacities.',
          why: 'Abstract criteria miss what matters: the web of care and dependency we are actually in. The unconscious patient is bound to grieving family; obligations grow from relationships, not from a checklist of traits.',
        },
      ],
      xpValue: 5,
    },
    {
      type: 'summary',
      title: 'What You Now Know',
      keyPoints: [
        'Moral status: mattering for one’s own sake',
        'Candidate criteria: sentience, personhood, species',
        '"Person" and "human" can come apart',
        'Species-only favoritism risks speciesism',
      ],
      closingThought: 'Drawing the circle of moral concern is one of ethics’ oldest, hardest, and most consequential acts.',
    },
  ],
};

export default lesson;
